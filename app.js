class AnimatedIcon {
  constructor(element, x = 0, y = 0, dx = 2, dy = 2) {
    this.element = element;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;

    this.element.style.position = "absolute";
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  animate() {
    this.x += this.dx;
    this.y += this.dy;

    // Reverse direction if the icon hits the boundary
    if (this.x + this.width > window.innerWidth || this.x < 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.height > window.innerHeight || this.y < 0) {
      this.dy = -this.dy;
    }
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
  image.src = "img/luigi.png";
  image.width = 60;
  image.height = 77;
  image.className = "animated-icon";
  fragment.appendChild(image);

  for (let i = 0; i < iconCount; i++) {
    const image = document.createElement("img");
    image.src = "img/wario.png";
    image.width = 60;
    image.height = 64;
    image.className = "animated-icon";
    fragment.appendChild(image);
  }

  for (let i = 0; i < iconCount; i++) {
    const image = document.createElement("img");
    image.src = "img/mario.png";
    image.width = 60;
    image.height = 69;
    image.className = "animated-icon";
    fragment.appendChild(image);
  }

  /*
  for (let i = 0; i < iconCount; i++) {
    const image = document.createElement("img");
    image.src = "img/yoshi.png";
    image.width = 60;
    image.height = 83;
    image.className = "animated-icon";
    fragment.appendChild(image);
  }
  */

  document.body.appendChild(fragment);

  icons = Array.from(document.querySelectorAll(".animated-icon")).map(
    (icon) => {
      const randomX = Math.random() * (window.innerWidth - 60); // Prevent overflow
      const randomY = Math.random() * (window.innerHeight - 64);
      const randomDx = (Math.random() - 0.5) * 5; // Random speed (-2.5 to 2.5)
      const randomDy = (Math.random() - 0.5) * 5;

      return new AnimatedIcon(icon, randomX, randomY, randomDx, randomDy);
    },
  );
}

function animateAll() {
  icons.forEach((icon) => {
    icon.animate();
  });

  requestAnimationFrame(() => {
    icons.forEach((icon) => icon.updatePosition());
    animateAll();
  });
}

init();
animateAll();
