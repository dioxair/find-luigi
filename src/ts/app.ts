import * as game from "./game";
import * as settings from "./settings";

export let gameRect: DOMRect;
export let gameOffsetWidth: number;
export let gameOffsetHeight: number;
// this is way too silly pls fix future me
export let realFPS: number;

export let isWindowFocused: boolean = true;

window.addEventListener("load", function () {
  // make gameWindow window non-responsive
  const gameWindow = document.getElementById("game")!;

  const initialWidth = gameWindow.offsetWidth;
  const initialHeight = gameWindow.offsetHeight;

  gameWindow.style.width = `${initialWidth}px`;
  gameWindow.style.height = `${initialHeight}px`;
  gameWindow.style.minWidth = `${initialWidth}px`;
  gameWindow.style.minHeight = `${initialHeight}px`;

  gameRect = gameWindow.getBoundingClientRect();
  gameOffsetWidth = initialWidth;
  gameOffsetHeight = initialHeight;

  window.addEventListener("resize", function () {
    gameWindow.style.width = `${initialWidth}px`;
    gameWindow.style.height = `${initialHeight}px`;
    gameWindow.style.minWidth = `${initialWidth}px`;
    gameWindow.style.minHeight = `${initialHeight}px`;
  });
});

const times: number[] = [];
let fps: number;
const fpsCounterElement: HTMLParagraphElement = document.getElementById(
  "fpsCounter",
) as HTMLParagraphElement;

function fpsCounter() {
  requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    fpsCounter();
  });
}

setInterval(() => {
  realFPS = fps;
  if (settings.showFPS) {
    fpsCounterElement.hidden = false;
    fpsCounterElement.textContent = `FPS: ${realFPS}`;
  } else {
    fpsCounterElement.hidden = true;
  }
}, 1000);

fpsCounter();

document
  .getElementById("startButton")
  ?.addEventListener("click", () => start());
document
  .getElementById("applySettingsButton")
  ?.addEventListener("click", () => {
    settings.applySettings();

    const audioElement: HTMLAudioElement = document.getElementById(
      "music",
    ) as HTMLAudioElement;
    if (settings.music) {
      audioElement.muted = false;
    } else {
      audioElement.muted = true;
    }
  });

function start() {
  (
    document.getElementById("startButton") as HTMLButtonElement
  ).style.visibility = "hidden";
  (document.getElementById("music") as HTMLAudioElement).play();

  game.init();
  requestAnimationFrame(game.animateAll);
}
