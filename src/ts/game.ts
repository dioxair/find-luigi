import { settings } from "./settings";
import * as app from "./app";
import AudioManager from "./audioManager";

// this is so fucking stupid oh my god
interface charImages {
  luigi: HTMLImageElement;
  mario: HTMLImageElement;
  wario: HTMLImageElement;
  yoshi: HTMLImageElement;
}

interface CharacterInstance {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Character {
  name: string;
  width: number;
  height: number;
}

interface workerIconInterface {
  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
}

const canvas: HTMLCanvasElement = document.getElementById(
  "gameCanvas",
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext(
  "2d",
) as CanvasRenderingContext2D;
let characters: CharacterInstance[] = [];
let worker = new Worker(
  new URL("./animation-worker.ts?worker&url", import.meta.url),
  { type: "module" },
);
let points = 0;
let isWindowFocused = true;
let isGameRunning = false;

const characterImages: charImages = {
  luigi: new Image(),
  mario: new Image(),
  wario: new Image(),
  yoshi: new Image(),
};

const audioManager = new AudioManager();

characterImages.luigi.src = "img/character/luigi.png";
characterImages.mario.src = "img/character/mario.png";
characterImages.wario.src = "img/character/wario.png";
characterImages.yoshi.src = "img/character/yoshi.png";

worker.onmessage = (event) => {
  const { type, positions } = event.data;
  if (type === "update") {
    positions.forEach((position: { x: number; y: number }, index: number) => {
      characters[index].x = position.x;
      characters[index].y = position.y;
    });
    drawCharacters();
  }
};

function drawCharacters() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  characters.forEach(({ img, x, y, width, height }) => {
    ctx.drawImage(img, x, y, width, height);
  });
}

function pushCharacter(
  character: Character,
  workerIcons: workerIconInterface[],
) {
  const randomX = Math.random() * (canvas.width - character.width);
  const randomY = Math.random() * (canvas.height - character.height);
  const randomDx = (Math.random() - 0.5) * settings.speed;
  const randomDy = (Math.random() - 0.5) * settings.speed;

  characters.push({
    img: characterImages[character.name as keyof charImages],
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

function init() {
  canvas.width = app.gameOffsetWidth;
  canvas.height = app.gameOffsetHeight;

  const allCharacters: Character[] = [
    { name: "luigi", width: 60, height: 77 },
    ...(settings.useMario ? [{ name: "mario", width: 60, height: 69 }] : []),
    ...(settings.useWario ? [{ name: "wario", width: 60, height: 64 }] : []),
    ...(settings.useYoshi ? [{ name: "yoshi", width: 60, height: 83 }] : []),
  ];

  const minIcons = settings.minIcons;
  const maxIcons = settings.maxIcons;
  const iconCount =
    Math.floor(Math.random() * (maxIcons - minIcons + 1)) + minIcons;

  const workerIcons: workerIconInterface[] = [];
  characters = [];

  pushCharacter(allCharacters[0], workerIcons);

  for (let i = 0; i < iconCount; i++) {
    let character = allCharacters[i % allCharacters.length];
    if (character.name === "luigi") {
      character = allCharacters[(i + 1) % allCharacters.length];
    }

    pushCharacter(character, workerIcons);
  }

  worker.postMessage({
    type: "init",
    iconData: workerIcons,
    gameWidth: canvas.width,
    gameHeight: canvas.height,
    movementThreshold: settings.movementThreshold,
    useInterpolation: settings.useInterpolation,
  });

  isGameRunning = true;
  requestAnimationFrame(animateAll);
}

export function animateAll() {
  if (isWindowFocused) {
    worker.postMessage({ type: "animate", time: performance.now() });
    requestAnimationFrame(animateAll);
  }
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  characters.forEach(({ x, y, width, height }, index) => {
    if (
      clickX >= x &&
      clickX <= x + width &&
      clickY >= y &&
      clickY <= y + height
    ) {
      if (characters[index].img === characterImages.luigi) {
        audioManager.playRandomCaughtSound();
        points++;
        console.log("Points:", points);
      }
    }
  });
});

window.addEventListener("focus", () => {
  isWindowFocused = true;
  const unfocusedNotice = document.getElementById(
    "unfocusedNotice",
  ) as HTMLDivElement;

  worker.postMessage({ type: "animate", time: performance.now() });
  worker.postMessage({ type: "pause", paused: false });
  canvas.style.display = "flex";
  if (isGameRunning) unfocusedNotice.style.display = "none";

  requestAnimationFrame(animateAll);
});

window.addEventListener("blur", () => {
  isWindowFocused = false;
  const unfocusedNotice = document.getElementById(
    "unfocusedNotice",
  ) as HTMLDivElement;

  worker.postMessage({ type: "animate", time: performance.now() });
  worker.postMessage({ type: "pause", paused: true });
  canvas.style.display = "none";
  if (isGameRunning) unfocusedNotice.style.display = "block";
});

export { init };
