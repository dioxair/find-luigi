import * as settings from "./settings";

class AnimatedIcon {
  element: HTMLImageElement;
  initialX: number;
  initialY: number;
  dx: number;
  dy: number;
  gameElement: HTMLDivElement;
  width: number;
  height: number;
  lastUpdate: number;
  lastX: number;
  lastY: number;
  currentX: number;
  currentY: number;

  constructor(
    element: HTMLImageElement,
    x = 0,
    y = 0,
    dx = 2,
    dy = 2,
    gameElement: HTMLDivElement,
  ) {
    this.element = element;
    this.initialX = x;
    this.initialY = y;
    this.dx = dx;
    this.dy = dy;
    this.gameElement = gameElement;
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;

    this.element.style.position = "absolute";
    this.element.style.visibility = "hidden";
    this.lastUpdate = performance.now();
    this.lastX = x;
    this.lastY = y;
    this.currentX = x;
    this.currentY = y;

    this.applyInitialPosition();
  }

  applyInitialPosition() {
    this.element.style.transform = `translate(${this.initialX}px, ${this.initialY}px)`;
    this.element.style.visibility = "visible";
  }

  updatePosition(time: number) {
    const elapsed = (time - this.lastUpdate) / 1000;

    const gameRect = this.gameElement.getBoundingClientRect();
    const gameWidth = gameRect.width;
    const gameHeight = gameRect.height;

    const newX = this.initialX + this.dx * elapsed;
    const newY = this.initialY + this.dy * elapsed;

    // Reverse direction if the icon hits the boundary of the game container
    if (newX + this.width > gameWidth || newX < 0) {
      this.dx = -this.dx;
    }
    if (newY + this.height > gameHeight || newY < 0) {
      this.dy = -this.dy;
    }

    // Update logical position
    this.initialX += this.dx * elapsed;
    this.initialY += this.dy * elapsed;

    if (
      Math.abs(this.initialX - this.lastX) > settings.movementThreshold ||
      Math.abs(this.initialY - this.lastY) > settings.movementThreshold
    ) {
      this.lastX = this.initialX;
      this.lastY = this.initialY;
    }

    if (settings.movementThreshold > 3) {
      const smoothingFactor = 0.1;
      this.currentX += (this.lastX - this.currentX) * smoothingFactor;
      this.currentY += (this.lastY - this.currentY) * smoothingFactor;
      this.element.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
    } else {
      this.element.style.transform = `translate(${this.lastX}px, ${this.lastY}px)`;
    }

    this.lastUpdate = time;
  }
}

let icons: AnimatedIcon[] = [];

export function init() {
  const minIcons = 50;
  const maxIcons = 100;
  const iconCount =
    Math.floor(Math.random() * (maxIcons - minIcons + 1)) + minIcons;

  const fragment = document.createDocumentFragment();
  const gameWindow: HTMLDivElement = document.getElementById(
    "game",
  ) as HTMLDivElement;

  const characters = [
    { src: "img/luigi.png", width: 60, height: 77 },
    { src: "img/mario.png", width: 60, height: 69 },
    { src: "img/wario.png", width: 60, height: 64 },
  ];

  const image = document.createElement("img");
  image.src = "img/luigi.png";
  image.width = 60;
  image.height = 77;
  image.className = "animated-icon";
  fragment.appendChild(image);

  const images: HTMLImageElement[] = [];

  for (let i = 0; i < iconCount * characters.length; i++) {
    const character = characters[Math.floor(i / iconCount)];
    if (character.src.includes("luigi")) continue;

    const image = document.createElement("img");
    image.src = character.src;
    image.width = character.width;
    image.height = character.height;
    image.className = "animated-icon";

    if (settings.shuffleCharacterLayers) {
      images.push(image);
    } else {
      fragment.appendChild(image);
    }
  }

  if (settings.shuffleCharacterLayers) {
    // Fisher-Yates Shuffle
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }

    images.forEach((image) => fragment.appendChild(image));
  }

  gameWindow.appendChild(fragment);

  icons = Array.from(
    document.querySelectorAll(".animated-icon") as NodeListOf<HTMLImageElement>,
  ).map((icon) => {
    const randomX = Math.random() * (gameWindow.offsetWidth - 60);
    const randomY = Math.random() * (gameWindow.offsetHeight - 70);
    const randomDx = (Math.random() - 0.5) * settings.speed;
    const randomDy = (Math.random() - 0.5) * settings.speed;

    return new AnimatedIcon(
      icon,
      randomX,
      randomY,
      randomDx,
      randomDy,
      gameWindow,
    );
  });
}

export function animateAll(time: number) {
  icons.forEach((icon) => icon.updatePosition(time));
  requestAnimationFrame(animateAll);
}
