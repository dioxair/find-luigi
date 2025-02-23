import * as game from "./game";
import { settings, applySettings } from "./settings";

export let gameRect: DOMRect;
export let gameOffsetWidth: number;
export let gameOffsetHeight: number;
// this is way too silly pls fix future me
export let realFPS: number;

const audioElement: HTMLAudioElement = document.getElementById(
  "music",
) as HTMLAudioElement;

window.addEventListener("load", function () {
  const gameWindow = document.getElementById("game")!;

  gameOffsetWidth = gameWindow.offsetWidth;
  gameOffsetHeight = gameWindow.offsetHeight;

  window.addEventListener("resize", function () {
    gameRect = gameWindow.getBoundingClientRect();
    gameOffsetWidth = gameWindow.offsetWidth;
    gameOffsetHeight = gameWindow.offsetHeight;

    gameWindow.style.width = `${gameOffsetWidth}px`;
    gameWindow.style.height = `${gameOffsetHeight}px`;
    gameWindow.style.minWidth = `${gameOffsetWidth}px`;
    gameWindow.style.minHeight = `${gameOffsetHeight}px`;
  });

  if (settings.music) {
    audioElement.muted = false;
  } else {
    audioElement.muted = true;
  }
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
    applySettings();

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
