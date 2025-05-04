import { Game } from "./game";
import { SettingsManager } from "./settings";
import AudioManager from "./audioManager";

const settingsManager = new SettingsManager();
const audioManager = new AudioManager();
const settings = settingsManager.getSettings();
let gameInstance: Game;
export let gameRect: DOMRect;
export let gameOffsetWidth: number;
export let gameOffsetHeight: number;
// this is way too silly pls fix future me
export let realFPS: number;

const gameWindow = document.getElementById("game")!;
const fullscreenButton = document.getElementById(
  "fullscreenButton",
) as HTMLButtonElement;

const customAlertOverlay = document.getElementById(
  "customAlertOverlay",
) as HTMLDivElement;
const customAlertText = document.getElementById(
  "customAlertText",
) as HTMLParagraphElement;
const customAlertCloseButton = document.getElementById(
  "customAlertClose",
) as HTMLButtonElement;

function showCustomAlert(text: string) {
  customAlertText.textContent = text;
  customAlertOverlay.style.display = "flex";
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function hideCustomAlert() {
  customAlertOverlay.style.display = "none";
  customAlertText.textContent = "";
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

customAlertCloseButton.addEventListener("click", hideCustomAlert);

window.addEventListener("load", async function () {
  gameOffsetWidth = gameWindow.offsetWidth;
  gameOffsetHeight = gameWindow.offsetHeight;

  await audioManager.loadAll();

  if (!settings.music) {
    audioManager.setVolume("music", 0);
  }

  const infoIcons = document.querySelectorAll(".info-label .label-info-icon");

  infoIcons.forEach((icon) => {
    const infoIcon = icon as HTMLImageElement;
    if (infoIcon.title) {
      infoIcon.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        showCustomAlert(infoIcon.title);
      });
    }
  });

  gameInstance = new Game(audioManager, settingsManager);
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

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    if (gameWindow.requestFullscreen) {
      gameWindow.requestFullscreen();
    } else if ((gameWindow as any).mozRequestFullScreen) {
      (gameWindow as any).mozRequestFullScreen();
    } else if ((gameWindow as any).webkitRequestFullscreen) {
      (gameWindow as any).webkitRequestFullscreen();
    } else if ((gameWindow as any).msRequestFullscreen) {
      (gameWindow as any).msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }
}

function updateFullscreenButton() {
  if (document.fullscreenElement) {
    fullscreenButton.textContent = "Exit Fullscreen";
  } else {
    fullscreenButton.textContent = "Fullscreen";
  }
}

fullscreenButton?.addEventListener("click", toggleFullscreen);

document.addEventListener("fullscreenchange", updateFullscreenButton);
document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
document.addEventListener("mozfullscreenchange", updateFullscreenButton);
document.addEventListener("MSFullscreenChange", updateFullscreenButton);

document
  .getElementById("startButton")
  ?.addEventListener("click", () => start());
document
  .getElementById("applySettingsButton")
  ?.addEventListener("click", () => {
    settingsManager.applySettings();
  });

async function start() {
  (
    document.getElementById("startButton") as HTMLButtonElement
  ).style.visibility = "hidden";

  const played = await audioManager.play("music");
  if (!played) {
    console.warn("Music did not start");
  }

  gameInstance.init();
}
