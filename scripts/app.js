// Settings
let movementThreshold = 1;
let speed = 200;

const movementThresholdField = document.getElementById(
  "movementThresholdField",
);
const speedField = document.getElementById("speedField");

speedField.addEventListener("input", function () {
  const speedFieldLabel = document.getElementById("speedFieldLabel");
  speedFieldLabel.childNodes[0].textContent = `Speed (value: ${speedField.value})`;
  speed = speedField.value;
});

function applySettings() {
  movementThreshold = movementThresholdField.value;
  speed = speedField.value;
}

window.addEventListener("load", function () {
  // make game window non-responsive
  const game = document.getElementById("game");

  const initialWidth = game.offsetWidth;
  const initialHeight = game.offsetHeight;

  game.style.width = `${initialWidth}px`;
  game.style.height = `${initialHeight}px`;
  game.style.minWidth = `${initialWidth}px`;
  game.style.minHeight = `${initialHeight}px`;

  window.addEventListener("resize", function () {
    game.style.width = `${initialWidth}px`;
    game.style.height = `${initialHeight}px`;
    game.style.minWidth = `${initialWidth}px`;
    game.style.minHeight = `${initialHeight}px`;
  });
});

class AnimatedIcon {
  constructor(element, x = 0, y = 0, dx = 2, dy = 2, gameElement) {
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

  updatePosition(time) {
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
      Math.abs(this.initialX - this.lastX) > movementThreshold ||
      Math.abs(this.initialY - this.lastY) > movementThreshold
    ) {
      this.lastX = this.initialX;
      this.lastY = this.initialY;
    }

    if (movementThreshold > 3) {
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

let icons = [];

function init() {
  const minIcons = 50;
  const maxIcons = 100;
  const iconCount =
    Math.floor(Math.random() * (maxIcons - minIcons + 1)) + minIcons;

  const fragment = document.createDocumentFragment();
  const game = document.getElementById("game");

  const characters = [
    { src: "assets/img/luigi.png", width: 60, height: 77 },
    { src: "assets/img/mario.png", width: 60, height: 69 },
    { src: "assets/img/wario.png", width: 60, height: 64 },
  ];

  const image = document.createElement("img");
  image.src = "assets/img/luigi.png";
  image.width = 60;
  image.height = 77;
  image.className = "animated-icon";
  fragment.appendChild(image);

  for (let i = 0; i < iconCount * characters.length; i++) {
    const character = characters[Math.floor(i / iconCount)];
    if (character.src.includes("luigi")) continue;

    const image = document.createElement("img");
    image.src = character.src;
    image.width = character.width;
    image.height = character.height;
    image.className = "animated-icon";
    fragment.appendChild(image);
  }

  game.appendChild(fragment);

  icons = Array.from(document.querySelectorAll(".animated-icon")).map(
    (icon) => {
      const randomX = Math.random() * (game.offsetWidth - 60);
      const randomY = Math.random() * (game.offsetHeight - 70);
      const randomDx = (Math.random() - 0.5) * speed;
      const randomDy = (Math.random() - 0.5) * speed;

      return new AnimatedIcon(icon, randomX, randomY, randomDx, randomDy, game);
    },
  );
}

function animateAll(time) {
  icons.forEach((icon) => icon.updatePosition(time));
  requestAnimationFrame(animateAll);
}

function start() {
  document.getElementById("startButton").style.visibility = "hidden";
  document.getElementById("music").play();

  init();
  requestAnimationFrame(animateAll);
}
