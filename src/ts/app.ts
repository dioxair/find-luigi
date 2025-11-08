import { Game } from "./game";
import { SettingsManager } from "./settings";
import AudioManager from "./audioManager";

// TODO: this is way too silly pls fix future me
let realFPS: number;

interface AppElements {
  gameWindow: HTMLDivElement;
  fullscreenButton: HTMLButtonElement;
  startButton: HTMLButtonElement;
  fpsCounter: HTMLParagraphElement;
  customAlertOverlay: HTMLDivElement;
  customAlertText: HTMLParagraphElement;
  customAlertClose: HTMLButtonElement;
  applySettingsButton: HTMLButtonElement;
}

class App {
  private readonly settingsManager = new SettingsManager();
  private readonly audioManager = new AudioManager();
  private readonly settings = this.settingsManager.getSettings();
  private gameInstance: Game | null = null;
  private initializationPromise: Promise<void> | null = null;
  private readonly fpsSamples: number[] = [];
  private fps = 0;
  private readonly elements: AppElements;

  constructor() {
    this.elements = this.getElements();
    this.registerAlertHandlers();
    this.registerStartHandler();
    this.registerSettingsHandler();
    this.registerFullscreenHandlers();
    this.startFpsTracking();

    window.addEventListener("load", () => {
      this.initialize().catch((error) => {
        console.error("Unable to initialize game on load", error);
      });
    });
  }

  private getElements(): AppElements {
    return {
      gameWindow: this.requireElement<HTMLDivElement>("game"),
      fullscreenButton:
        this.requireElement<HTMLButtonElement>("fullscreenButton"),
      startButton: this.requireElement<HTMLButtonElement>("startButton"),
      fpsCounter: this.requireElement<HTMLParagraphElement>("fpsCounter"),
      customAlertOverlay:
        this.requireElement<HTMLDivElement>("customAlertOverlay"),
      customAlertText:
        this.requireElement<HTMLParagraphElement>("customAlertText"),
      customAlertClose:
        this.requireElement<HTMLButtonElement>("customAlertClose"),
      applySettingsButton: this.requireElement<HTMLButtonElement>(
        "applySettingsButton",
      ),
    };
  }

  private requireElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id) as T | null;
    if (!element) {
      throw new Error(`Missing element with id "${id}"`);
    }
    return element;
  }

  private registerAlertHandlers(): void {
    this.elements.customAlertClose.addEventListener("click", () =>
      this.hideCustomAlert(),
    );
  }

  private registerStartHandler(): void {
    this.elements.startButton.addEventListener("click", () =>
      this.handleStartClick(),
    );
  }

  private registerSettingsHandler(): void {
    this.elements.applySettingsButton.addEventListener("click", () =>
      this.settingsManager.applySettings(),
    );
  }

  private registerFullscreenHandlers(): void {
    this.elements.fullscreenButton.addEventListener("click", () =>
      this.toggleFullscreen(),
    );

    document.addEventListener("fullscreenchange", () =>
      this.updateFullscreenButton(),
    );

    this.updateFullscreenButton();
  }

  private startFpsTracking(): void {
    this.trackFpsSamples();
    const FPS_UPDATE_INTERVAL_MS = 1000;
    setInterval(() => this.updateFpsDisplay(), FPS_UPDATE_INTERVAL_MS);
  }

  private trackFpsSamples(): void {
    requestAnimationFrame(() => {
      const now = performance.now();
      while (this.fpsSamples.length > 0 && this.fpsSamples[0] <= now - 1000) {
        this.fpsSamples.shift();
      }
      this.fpsSamples.push(now);
      this.fps = this.fpsSamples.length;
      this.trackFpsSamples();
    });
  }

  private updateFpsDisplay(): void {
    realFPS = this.fps;
    const { fpsCounter } = this.elements;

    if (this.settings.showFPS) {
      fpsCounter.hidden = false;
      fpsCounter.textContent = `FPS: ${realFPS}`;
    } else {
      fpsCounter.hidden = true;
    }
  }

  private async initialize(): Promise<void> {
    if (this.gameInstance) {
      return;
    }

    if (!this.initializationPromise) {
      this.initializationPromise = this.prepareGame().catch((error) => {
        this.initializationPromise = null;
        console.error("Failed to initialize game", error);
        throw error;
      });
    }

    await this.initializationPromise;
  }

  private async prepareGame(): Promise<void> {
    await this.audioManager.loadAll();

    if (!this.settings.music) {
      // TODO: implement muting and unmuting individual sounds
      this.audioManager.setVolume("music", 0);
    }

    this.attachInfoIconHandlers();
    this.gameInstance = new Game(this.audioManager, this.settingsManager);
  }

  private attachInfoIconHandlers(): void {
    document.querySelectorAll(".info-label .label-info-icon").forEach((iconNode) => {
      const icon = iconNode as HTMLImageElement;
      if (!icon.title) {
        return;
      }

      icon.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.showCustomAlert(icon.title);
      });
    });
  }

  private async handleStartClick(): Promise<void> {
    const { startButton } = this.elements;
    if (startButton.disabled) {
      return;
    }

    startButton.disabled = true;

    try {
      await this.initialize();
    } catch (error) {
      startButton.disabled = false;
      console.error("Start aborted due to initialization failure", error);
      return;
    }

    startButton.style.visibility = "hidden";

    const played = await this.audioManager.play("music");
    if (!played) {
      console.warn("Music did not start");
    }

    if (!this.gameInstance) {
      startButton.disabled = false;
      startButton.style.visibility = "visible";
      console.error("Game instance missing after initialization");
      return;
    }

    this.gameInstance.init();
  }

  private toggleFullscreen(): void {
    const { gameWindow } = this.elements;

    if (!document.fullscreenElement) {
      gameWindow.requestFullscreen();
      return;
    }
    document.exitFullscreen();
  }

  private updateFullscreenButton(): void {
    const { fullscreenButton } = this.elements;
    fullscreenButton.textContent = document.fullscreenElement
      ? "Exit Fullscreen"
      : "Fullscreen";
  }

  private showCustomAlert(text: string): void {
    const { customAlertOverlay, customAlertText } = this.elements;
    customAlertText.textContent = text;
    customAlertOverlay.style.display = "flex";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  private hideCustomAlert(): void {
    const { customAlertOverlay, customAlertText } = this.elements;
    customAlertOverlay.style.display = "none";
    customAlertText.textContent = "";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }
}

new App();
