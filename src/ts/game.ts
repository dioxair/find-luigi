import * as settings from "./settings";
import * as app from "./app";

interface IconData {
  x: number;
  y: number;
}

interface Character {
  src: string;
  width: number;
  height: number;
}

class AnimatedIcon {
  element: HTMLImageElement;

  constructor(element: HTMLImageElement) {
    this.element = element;

    this.element.style.position = "absolute";
    this.element.style.transform = "translate3d(0px, 0px, 0)";
  }

  updatePosition(x: number, y: number) {
    this.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
}

let icons: AnimatedIcon[] = [];
const worker = new Worker(
  new URL("./animation-worker.ts?worker&url", import.meta.url),
  { type: "module" },
);

worker.onmessage = (event) => {
  const { type, positions } = event.data;
  if (type === "update") {
    positions.forEach((position: IconData, index: number) => {
      const icon = icons[index];
      icon.updatePosition(position.x, position.y);
    });
  }
};

function newCharacterInstance(character: Character) {
  const image = document.createElement("img");
  image.src = character.src;
  image.width = character.width;
  image.height = character.height;
  image.className = "animated-icon";

  const randomX = Math.random() * (app.gameRect.width - character.width);
  const randomY = Math.random() * (app.gameRect.height - character.height);
  const randomDx = (Math.random() - 0.5) * settings.speed;
  const randomDy = (Math.random() - 0.5) * settings.speed;

  return {
    image: image,
    randomX: randomX,
    randomY: randomY,
    randomDx: randomDx,
    randomDy: randomDy,
  };
}

export function init() {
  const gameWindow: HTMLDivElement = document.getElementById(
    "game",
  ) as HTMLDivElement;

  const minIcons = settings.minIcons;
  const maxIcons = settings.maxIcons;
  const iconCount =
    Math.floor(Math.random() * (maxIcons - minIcons + 1)) + minIcons;

  const fragment = document.createDocumentFragment();
  const characters: Character[] = [
    { src: "img/character/luigi.png", width: 60, height: 77 },
    { src: "img/character/mario.png", width: 60, height: 69 },
    { src: "img/character/wario.png", width: 60, height: 64 },
  ];

  const workerIcons = [];
  const images = [];

  const properties = newCharacterInstance(characters[0]);

  workerIcons.push({
    x: properties.randomX,
    y: properties.randomY,
    dx: properties.randomDx,
    dy: properties.randomDy,
    width: characters[0].width,
    height: characters[0].height,
  });

  images.push(properties.image);

  const animatedIcon = new AnimatedIcon(properties.image);
  animatedIcon.updatePosition(properties.randomX, properties.randomY);
  icons.push(animatedIcon);

  for (let i = 0; i < iconCount - 1; i++) {
    let character = characters[i % characters.length];
    if (character.src.includes("luigi")) {
      character = characters[(i + 1) % characters.length];
    }

    const properties = newCharacterInstance(character);

    workerIcons.push({
      x: properties.randomX,
      y: properties.randomY,
      dx: properties.randomDx,
      dy: properties.randomDy,
      width: character.width,
      height: character.height,
    });

    images.push(properties.image);

    const animatedIcon = new AnimatedIcon(properties.image);
    animatedIcon.updatePosition(properties.randomX, properties.randomY);
    icons.push(animatedIcon);
  }

  if (settings.shuffleCharacterLayers) {
    // Fisher-Yates Shuffle
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }
  }

  images.forEach((image) => fragment.appendChild(image));

  gameWindow.appendChild(fragment);

  worker.postMessage({
    type: "init",
    iconData: workerIcons,
    gameWidth: app.gameRect.width,
    gameHeight: app.gameRect.height,
    movementThreshold: settings.movementThreshold,
    useInterpolation: settings.useInterpolation,
  });
}

export function animateAll() {
  worker.postMessage({
    type: "animate",
    time: performance.now(),
  });

  requestAnimationFrame(animateAll);
}
