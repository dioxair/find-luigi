interface IconData {
  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
  lastX: number;
  lastY: number;
  currentX: number;
  currentY: number;
}

let icons: IconData[] = [];
let gameWidth: number;
let gameHeight: number;
let lastTimestamp: number | null = null;
let movementThreshold: number;
let useInterpolation: boolean;
let paused = false;
const smoothingFactor = 0.1;

onmessage = (event) => {
  const { type, ...data } = event.data;

  if (type === "init") {
    icons = data.iconData.map((icon: IconData) => ({
      ...icon,
      lastX: icon.x,
      lastY: icon.y,
      currentX: icon.x,
      currentY: icon.y,
    }));
    gameWidth = data.gameWidth;
    gameHeight = data.gameHeight;
    movementThreshold = data.movementThreshold;
    useInterpolation = data.useInterpolation;
  } else if (type === "animate" && !paused) {
    updatePositions(data.time);
  } else if (type === "pause") {
    const wasPaused = paused;
    paused = data.paused;

    if (!paused && wasPaused) {
      lastTimestamp = null;
      icons = icons.map((icon) => ({
        ...icon,
        currentX: icon.x,
        currentY: icon.y,
        lastX: icon.x,
        lastY: icon.y,
      }));

      postMessage({
        type: "update",
        positions: icons.map((icon) => ({ x: icon.x, y: icon.y })),
      });
    }
  }
};

function updatePositions(currentTimestamp: number) {
  if (paused) return;

  if (lastTimestamp === null) {
    lastTimestamp = currentTimestamp;
    return;
  }

  const maxDelta = 0.1;
  let deltaTime = (currentTimestamp - lastTimestamp!) / 1000;

  if (deltaTime > maxDelta) {
    deltaTime = maxDelta;
  }

  icons = icons.map((icon) => {
    let newX = icon.x + icon.dx * deltaTime;
    let newY = icon.y + icon.dy * deltaTime;

    // Boundary checks
    newX = Math.max(0, Math.min(newX, gameWidth - icon.width));
    newY = Math.max(0, Math.min(newY, gameHeight - icon.height));

    // Bounce logic
    if (newX <= 0 || newX >= gameWidth - icon.width) {
      icon.dx *= -1;
      newX = Math.max(0, Math.min(newX, gameWidth - icon.width));
    }
    if (newY <= 0 || newY >= gameHeight - icon.height) {
      icon.dy *= -1;
      newY = Math.max(0, Math.min(newY, gameHeight - icon.height));
    }

    icon.x = newX;
    icon.y = newY;

    if (
      Math.abs(newX - icon.lastX) > movementThreshold ||
      Math.abs(newY - icon.lastY) > movementThreshold
    ) {
      icon.lastX = newX;
      icon.lastY = newY;
    }

    if (useInterpolation) {
      icon.currentX += (icon.lastX - icon.currentX) * smoothingFactor;
      icon.currentY += (icon.lastY - icon.currentY) * smoothingFactor;
    } else {
      icon.currentX = icon.lastX;
      icon.currentY = icon.lastY;
    }

    return icon;
  });

  lastTimestamp = currentTimestamp;

  postMessage({
    type: "update",
    positions: icons.map((icon) => ({
      x: icon.currentX,
      y: icon.currentY,
    })),
  });
}
