class AnimatedIcon {
  constructor(element, x = 0, y = 0, dx = 2, dy = 2) {
    this.element = element;
    this.initialX = x;
    this.initialY = y;
    this.dx = dx;
    this.dy = dy;

    // Threshold for updating the DOM only if there's a noticeable change (default 1 pixel)
    this.movementThreshold = 1;
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;

    this.element.style.position = "absolute";
    this.element.style.visibility = "hidden";
    this.lastUpdate = performance.now();
    this.lastX = x;
    this.lastY = y;

    this.applyInitialPosition();
  }

  applyInitialPosition() {
    this.element.style.transform = `translate(${this.initialX}px, ${this.initialY}px)`;
    this.element.style.visibility = "visible"; // Show the element after positioning
  }

  updatePosition(time) {
    const elapsed = (time - this.lastUpdate) / 1000; // Elapsed time in seconds
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

  for (let i = 0; i < iconCount; i++) {
    const image = document.createElement("img");
    image.src = "assets/img/wario.png";
    image.width = 60;
    image.height = 64;
    image.className = "animated-icon";
    fragment.appendChild(image);
  }

  for (let i = 0; i < iconCount; i++) {
    const image = document.createElement("img");
    image.src = "assets/img/mario.png";
    image.width = 60;
    image.height = 69;
    image.className = "animated-icon";
    fragment.appendChild(image);
  }

  document.body.appendChild(fragment);

  icons = Array.from(document.querySelectorAll(".animated-icon")).map(
    (icon) => {
      const randomX = Math.random() * (window.innerWidth - 60); // Prevent overflow
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
