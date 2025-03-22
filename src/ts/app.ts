import { Game } from "./game";
import { SettingsManager } from "./settings";
import AudioManager from "./audioManager";

const settingsManager = new SettingsManager();
const audioManager = new AudioManager();
const settings = settingsManager.getSettings();
export let gameRect: DOMRect;
export let gameOffsetWidth: number;
export let gameOffsetHeight: number;
// this is way too silly pls fix future me
export let realFPS: number;

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

  if (!settings.music) {
    audioManager.muteMusic();
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
    settingsManager.applySettings();
  });

function start() {
  (
    document.getElementById("startButton") as HTMLButtonElement
  ).style.visibility = "hidden";
  audioManager.playMusic();

  Game.init();
  requestAnimationFrame(Game.animateAll);
}
