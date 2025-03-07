import { settings } from "./settings";
import * as app from "./app";
import AudioManager from "./audioManager";

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
  private points: number = 0;
  private isWindowFocused: boolean = true;

  constructor(audioManager: AudioManager) {
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.audioManager = audioManager;
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
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
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
    const randomDx = (Math.random() - 0.5) * settings.speed;
    const randomDy = (Math.random() - 0.5) * settings.speed;

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
      ...(settings.useMario ? [{ name: "mario", width: 60, height: 69 }] : []),
      ...(settings.useWario ? [{ name: "wario", width: 60, height: 64 }] : []),
      ...(settings.useYoshi ? [{ name: "yoshi", width: 60, height: 83 }] : []),
    ];

    const minIcons = settings.minIcons;
    const maxIcons = settings.maxIcons;
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

    this.worker.postMessage({
      type: "init",
      iconData: workerIcons,
      gameWidth: this.canvas.width,
      gameHeight: this.canvas.height,
      movementThreshold: settings.movementThreshold,
      useInterpolation: settings.useInterpolation,
    });

    requestAnimationFrame(this.animateAll.bind(this));
  }

  private handleCanvasClick(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    this.characters.forEach(({ x, y, width, height, img }) => {
      if (
        clickX >= x &&
        clickX <= x + width &&
        clickY >= y &&
        clickY <= y + height
      ) {
        if (img === this.characterImages.luigi) {
          this.audioManager.playRandomCaughtSound();
          this.points++;
          console.log("Points:", this.points);
        }
      }
    });
  }

  private handleWindowFocus() {
    this.isWindowFocused = true;
    document.getElementById("unfocusedNotice")!.style.display = "none";
    this.worker.postMessage({ type: "pause", paused: false });
    requestAnimationFrame(this.animateAll.bind(this));
  }

  private handleWindowBlur() {
    this.isWindowFocused = false;
    document.getElementById("unfocusedNotice")!.style.display = "block";
    this.worker.postMessage({ type: "pause", paused: true });
  }

  public animateAll = () => {
    if (this.isWindowFocused) {
      this.worker.postMessage({ type: "animate", time: performance.now() });
      requestAnimationFrame(this.animateAll);
    }
  };
}

const gameInstance = new Game(new AudioManager());
export { gameInstance as Game };
