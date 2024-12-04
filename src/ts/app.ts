import * as game from "./game";
import * as settings from "./settings";

export let gameRect: DOMRect;
export let gameOffsetWidth: number;
export let gameOffsetHeight: number;

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

  // FPS Counter UI soon ;)
  const times: number[] = [];
  let fps: number;
  let isFpsOn = false;

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

  if (isFpsOn) {
    setInterval(() => {
      console.log(fps);
    }, 1000);

    fpsCounter();
  }
});

document
  .getElementById("startButton")
  ?.addEventListener("click", () => start());
document
  .getElementById("applySettingsButton")
  ?.addEventListener("click", () => settings.applySettings());

function start() {
  (
    document.getElementById("startButton") as HTMLButtonElement
  ).style.visibility = "hidden";
  (document.getElementById("music") as HTMLAudioElement).play();

  game.init();
  requestAnimationFrame(game.animateAll);
}
