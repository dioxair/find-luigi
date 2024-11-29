// Create a class to handle the animation for each icon
class AnimatedIcon {
  constructor(element, x = 0, y = 0, dx = 2, dy = 2) {
    this.element = element;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;

    // Set initial position
    this.element.style.position = "absolute";
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
  }

  animate() {
    this.x += this.dx;
    this.y += this.dy;

    // Reverse direction if the icon hits the boundary
    if (this.x + this.element.offsetWidth > window.innerWidth || this.x < 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.element.offsetHeight > window.innerHeight || this.y < 0) {
      this.dy = -this.dy;
    }

    this.updatePosition();
  }
}

const icons = init();

function init() {
  const minIcons = 10;
  const maxIcons = 30;

  const iconCount =
    Math.floor(Math.random() * (maxIcons - minIcons + 1)) + minIcons;

  for (let i = 0; i < iconCount; i++) {
    const image = document.createElement("img");
    image.src = "img/luigi.png";
    image.className = "animated-icon";
    document.body.appendChild(image);
  }

  // Initialize multiple icons and animate them
  const icons = Array.from(document.querySelectorAll(".animated-icon")).map(
    (icon) => {
      const randomX = (Math.random() * window.innerWidth) / 2;
      const randomY = (Math.random() * window.innerHeight) / 2;
      const randomDx = Math.random() * 5; // Random speed between 1 and 5
      const randomDy = Math.random() * 5; // Random speed between 1 and 5

      return new AnimatedIcon(icon, randomX, randomY, randomDx, randomDy);
    },
  );

  return icons;
}

function animateAll() {
  icons.forEach((icon) => icon.animate());
  requestAnimationFrame(animateAll);
}

animateAll();
