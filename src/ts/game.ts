import * as app from "./app";
import AudioManager from "./audioManager";
import { Settings, SettingsManager } from "./settings";

interface CharacterImages {
  [key: string]: HTMLImageElement;
}

interface CharacterInstance {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CharacterConfig {
  name: string;
  width: number;
  height: number;
}

interface WorkerIcon {
  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private characters: CharacterInstance[] = [];
  private worker: Worker;
  private characterImages: CharacterImages = {};
  private audioManager: AudioManager;
  private settings: Settings;
  private animationFrameId: number = 0;
  private points: number = 0;
  private isWindowFocused: boolean = true;
  private isGameRunning: boolean = false;

  constructor(audioManager: AudioManager, settingsManager: SettingsManager) {
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.audioManager = audioManager;
    this.settings = settingsManager.getSettings();
    this.worker = new Worker(
      new URL("./animation-worker.ts?worker&url", import.meta.url),
      { type: "module" },
    );

    this.loadCharacterImages();
    this.setupEventListeners();
  }

  private loadCharacterImages() {
    ["luigi", "mario", "wario", "yoshi"].forEach((name) => {
      const img = new Image();
      img.src = `img/character/${name}.png`;
      this.characterImages[name] = img;
    });
  }

  private setupEventListeners() {
    if (!this.worker.onmessage) {
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
    }

    // stupid way of avoiding duplicate event listeners
    this.canvas.removeEventListener("click", this.handleCanvasClick.bind(this));
    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));

    window.removeEventListener("focus", this.handleWindowFocus.bind(this));
    window.removeEventListener("blur", this.handleWindowBlur.bind(this));

    window.addEventListener("focus", this.handleWindowFocus.bind(this));
    window.addEventListener("blur", this.handleWindowBlur.bind(this));
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, positions } = event.data;
    if (type === "update") {
      positions.forEach((position: { x: number; y: number }, index: number) => {
        if (this.characters[index]) {
          this.characters[index].x = position.x;
          this.characters[index].y = position.y;
        }
      });
      this.drawCharacters();
    }
  }

  private drawCharacters() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.characters.forEach(({ img, x, y, width, height }) => {
      this.ctx.drawImage(img, x, y, width, height);
    });
  }

  private addCharacter(character: CharacterConfig, workerIcons: WorkerIcon[]) {
    const randomX = Math.random() * (this.canvas.width - character.width);
    const randomY = Math.random() * (this.canvas.height - character.height);
    const randomDx = (Math.random() - 0.5) * this.settings.speed;
    const randomDy = (Math.random() - 0.5) * this.settings.speed;

    this.characters.push({
      img: this.characterImages[character.name],
      x: randomX,
      y: randomY,
      width: character.width,
      height: character.height,
    });

    workerIcons.push({
      x: randomX,
      y: randomY,
      dx: randomDx,
      dy: randomDy,
      width: character.width,
      height: character.height,
    });
  }

  public init() {
    this.canvas.width = app.gameOffsetWidth;
    this.canvas.height = app.gameOffsetHeight;

    const availableCharacters: CharacterConfig[] = [
      { name: "luigi", width: 60, height: 77 },
      this.settings.useMario && { name: "mario", width: 60, height: 69 },
      this.settings.useWario && { name: "wario", width: 60, height: 64 },
      this.settings.useYoshi && { name: "yoshi", width: 60, height: 83 },
    ].filter(Boolean) as CharacterConfig[];

    const minIcons = this.settings.minIcons;
    const maxIcons = this.settings.maxIcons;
    const iconCount =
      Math.floor(Math.random() * (maxIcons - minIcons + 1)) + minIcons;
    const workerIcons: WorkerIcon[] = [];
    this.characters = [];

    this.addCharacter(availableCharacters[0], workerIcons);

    for (let i = 0; i < iconCount; i++) {
      let character = availableCharacters[i % availableCharacters.length];
      if (character.name === "luigi") {
        character = availableCharacters[(i + 1) % availableCharacters.length];
      }
      this.addCharacter(character, workerIcons);
    }

    if (this.settings.shuffleCharacterLayers) {
      this.characters = this.shuffleArray<CharacterInstance>(this.characters);
    }

    this.worker.postMessage({
      type: "init",
      iconData: workerIcons,
      gameWidth: this.canvas.width,
      gameHeight: this.canvas.height,
      movementThreshold: this.settings.movementThreshold,
      useInterpolation: this.settings.useInterpolation,
    });

    this.isGameRunning = true;
    this.animationFrameId = requestAnimationFrame(this.animateAll);
  }

  private handleCanvasClick(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    this.characters.forEach(({ x, y, width, height, img }) => {
      if (
        clickX >= x &&
        clickX <= x + width &&
        clickY >= y &&
        clickY <= y + height
      ) {
        if (img === this.characterImages.luigi && this.isGameRunning) {
          if (this.settings.SFX) {
            this.audioManager.playRandomCaughtSound();
          }
          this.points++;
          console.log("Points:", this.points);

          this.characters = this.characters.filter(
            (character) => character.img === this.characterImages.luigi,
          );
          this.drawCharacters();

          this.worker.postMessage({ type: "pause", paused: true });
          this.isGameRunning = false;
          setTimeout(() => this.restartGame(), 3000);
        }
      }
    });
  }

  private restartGame() {
    if (this.worker) {
      this.worker.terminate();
    }

    cancelAnimationFrame(this.animationFrameId);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.worker = new Worker(
      new URL("./animation-worker.ts?worker&url", import.meta.url),
      { type: "module" },
    );

    this.setupEventListeners();
    this.init();
  }

  private handleWindowFocus() {
    this.isWindowFocused = true;
    if (this.isGameRunning) {
      this.canvas.style.display = "flex";
      document.getElementById("unfocusedNotice")!.style.display = "none";
      this.worker.postMessage({ type: "pause", paused: false });

      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = requestAnimationFrame(this.animateAll);
    }
  }

  private handleWindowBlur() {
    this.isWindowFocused = false;
    if (this.isGameRunning) {
      this.canvas.style.display = "none";
      document.getElementById("unfocusedNotice")!.style.display = "block";
      this.worker.postMessage({ type: "pause", paused: true });
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public animateAll = () => {
    if (this.isWindowFocused) {
      this.worker.postMessage({ type: "animate", time: performance.now() });
      this.animationFrameId = requestAnimationFrame(this.animateAll);
    }
  };
}

const gameInstance = new Game(new AudioManager(), new SettingsManager());
export { gameInstance as Game };
