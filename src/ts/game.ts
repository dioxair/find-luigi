import { settings } from "./settings";
import * as app from "./app";

// this is so fucking stupid oh my god
interface charImages {
  luigi: HTMLImageElement;
  mario: HTMLImageElement;
  wario: HTMLImageElement;
  yoshi: HTMLImageElement;
}

let canvas: HTMLCanvasElement = document.getElementById(
  "gameCanvas",
) as HTMLCanvasElement;
let ctx: CanvasRenderingContext2D = canvas.getContext(
  "2d",
) as CanvasRenderingContext2D;
let characters: {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}[] = [];
let worker = new Worker(
  new URL("./animation-worker.ts?worker&url", import.meta.url),
  { type: "module" },
);
let points = 0;
let isWindowFocused = true;

const characterImages: charImages = {
  luigi: new Image(),
  mario: new Image(),
  wario: new Image(),
  yoshi: new Image(),
};

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

function init() {
  canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;

  canvas.width = app.gameOffsetWidth;
  canvas.height = app.gameOffsetHeight;

  const allCharacters = [
    { name: "luigi", width: 60, height: 77 },
    ...(settings.useMario ? [{ name: "mario", width: 60, height: 69 }] : []),
    ...(settings.useWario ? [{ name: "wario", width: 60, height: 64 }] : []),
    ...(settings.useYoshi ? [{ name: "yoshi", width: 60, height: 83 }] : []),
  ];

  const minIcons = settings.minIcons;
  const maxIcons = settings.maxIcons;
  const iconCount =
    Math.floor(Math.random() * (maxIcons - minIcons + 1)) + minIcons;

  const workerIcons = [];
  characters = [];

  const character = allCharacters[0];
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

  for (let i = 0; i < iconCount; i++) {
    let character = allCharacters[i % allCharacters.length];
    if (character.name === "luigi") {
      character = allCharacters[(i + 1) % allCharacters.length];
    }
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

  console.log(
    `Characters: ${characters.length}\nWorker icons: ${workerIcons.length}`,
  );

  worker.postMessage({
    type: "init",
    iconData: workerIcons,
    gameWidth: canvas.width,
    gameHeight: canvas.height,
    movementThreshold: settings.movementThreshold,
    useInterpolation: settings.useInterpolation,
  });

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
        points++;
        console.log("Points:", points);
      }
    }
  });
});

window.addEventListener("focus", () => {
  isWindowFocused = true;

  worker.postMessage({ type: "animate", time: performance.now() });
  worker.postMessage({ type: "pause", paused: false });

  requestAnimationFrame(animateAll);
});

window.addEventListener("blur", () => {
  isWindowFocused = false;

  worker.postMessage({ type: "animate", time: performance.now() });
  worker.postMessage({ type: "pause", paused: true });
});

export { init };
