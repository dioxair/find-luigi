class AnimatedIcon {
  constructor(element, x = 0, y = 0, dx = 2, dy = 2) {
    this.element = element;
    this.initialX = x;
    this.initialY = y;
    this.dx = dx;
    this.dy = dy;
    // Threshold for updating the DOM only if there's a noticeable change
    this.movementThreshold = 1;
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;

    this.element.style.position = "absolute";
    this.element.style.visibility = "hidden";
    this.lastUpdate = performance.now();
    this.lastX = x;
    this.lastY = y;

    // Interpolated positions (only used for smoothing)
    this.currentX = x;
    this.currentY = y;

    this.applyInitialPosition();
  }

  applyInitialPosition() {
    this.element.style.transform = `translate(${this.initialX}px, ${this.initialY}px)`;
    // Show the element after positioning
    this.element.style.visibility = "visible";
  }

  updatePosition(time) {
    const elapsed = (time - this.lastUpdate) / 1000;
    const newX = this.initialX + this.dx * elapsed;
    const newY = this.initialY + this.dy * elapsed;

    // Reverse direction if the icon hits the boundary
    if (newX + this.width > window.innerWidth || newX < 0) {
      this.dx = -this.dx;
    }
    if (newY + this.height > window.innerHeight || newY < 0) {
      this.dy = -this.dy;
    }

    // Update the logical position
    this.initialX += this.dx * elapsed;
    this.initialY += this.dy * elapsed;

    if (
      Math.abs(this.initialX - this.lastX) > this.movementThreshold ||
      Math.abs(this.initialY - this.lastY) > this.movementThreshold
    ) {
      this.lastX = this.initialX;
      this.lastY = this.initialY;
    }

    if (this.movementThreshold > 3) {
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

  const image = document.createElement("img");
  image.src = "assets/img/luigi.png";
  image.width = 60;
  image.height = 77;
  image.className = "animated-icon";
  fragment.appendChild(image);

  const characters = [
    { src: "assets/img/luigi.png", width: 60, height: 77 },
    { src: "assets/img/mario.png", width: 60, height: 69 },
    { src: "assets/img/wario.png", width: 60, height: 64 },
    // { src: "assets/img/yoshi.png", width: 60, height: 83 },
  ];

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

  document.body.appendChild(fragment);

  icons = Array.from(document.querySelectorAll(".animated-icon")).map(
    (icon) => {
      // Prevent going out of bounds
      const randomX = Math.random() * (window.innerWidth - 60);
      const randomY = Math.random() * (window.innerHeight - 70);
      const randomDx = (Math.random() - 0.5) * 200;
      const randomDy = (Math.random() - 0.5) * 200;

      return new AnimatedIcon(icon, randomX, randomY, randomDx, randomDy);
    },
  );
}

function animateAll(time) {
  icons.forEach((icon) => icon.updatePosition(time));
  requestAnimationFrame(animateAll);
}

init();
requestAnimationFrame(animateAll);
