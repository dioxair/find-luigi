interface IconData {
  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
  currentX: number;
  currentY: number;
  lastX: number;
  lastY: number;
}

let icons: IconData[] = [];
let gameWidth: number;
let gameHeight: number;
let lastTimestamp: number | null = null;
let movementThreshold: number;
let useInterpolation: boolean;
const smoothingFactor = 0.1;

onmessage = (event) => {
  const { type, ...data } = event.data;

  if (type === "init") {
    icons = data.iconData.map((icon: IconData) => ({
      ...icon,
      currentX: icon.x,
      currentY: icon.y,
      lastX: icon.x,
      lastY: icon.y,
    }));
    gameWidth = data.gameWidth;
    gameHeight = data.gameHeight;
    movementThreshold = data.movementThreshold;
    useInterpolation = data.useInterpolation;
  } else if (type === "animate") {
    calculatePositions(data.time);
  }
};

function calculatePositions(currentTimestamp: number) {
  if (lastTimestamp === null) {
    lastTimestamp = currentTimestamp;
    return;
  }

  const deltaTime = (currentTimestamp - lastTimestamp) / 1000;

  icons = icons.map((icon) => {
    let newX = icon.x + icon.dx * deltaTime;
    let newY = icon.y + icon.dy * deltaTime;

    // Clamp newX and newY within game boundaries
    newX = Math.max(0, Math.min(newX, gameWidth - icon.width));
    newY = Math.max(0, Math.min(newY, gameHeight - icon.height));

    if (newX === 0 || newX === gameWidth - icon.width) {
      icon.dx = -icon.dx;
    }
    if (newY === 0 || newY === gameHeight - icon.height) {
      icon.dy = -icon.dy;
    }

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
    }

    return { ...icon, x: newX, y: newY };
  });

  lastTimestamp = currentTimestamp;

  if (useInterpolation) {
    postMessage({
      type: "update",
      positions: icons.map((icon) => ({
        x: icon.currentX,
        y: icon.currentY,
      })),
    });
  } else {
    postMessage({
      type: "update",
      positions: icons.map((icon) => ({
        x: icon.lastX,
        y: icon.lastY,
      })),
    });
  }
}
