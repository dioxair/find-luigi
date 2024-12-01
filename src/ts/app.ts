import * as game from "./game"
import * as settings from "./settings"

window.addEventListener("load", function() {
  // make gameWindow window non-responsive
  const gameWindow = document.getElementById("game")!;

  const initialWidth = gameWindow.offsetWidth;
  const initialHeight = gameWindow.offsetHeight;

  gameWindow.style.width = `${initialWidth}px`;
  gameWindow.style.height = `${initialHeight}px`;
  gameWindow.style.minWidth = `${initialWidth}px`;
  gameWindow.style.minHeight = `${initialHeight}px`;

  window.addEventListener("resize", function() {
    gameWindow.style.width = `${initialWidth}px`;
    gameWindow.style.height = `${initialHeight}px`;
    gameWindow.style.minWidth = `${initialWidth}px`;
    gameWindow.style.minHeight = `${initialHeight}px`;
  });
});

document.getElementById("startButton")?.addEventListener("click",
  () => start())
document.getElementById("applySettingsButton")?.addEventListener("click",
  () => settings.applySettings())

function start() {
  (document.getElementById("startButton") as HTMLButtonElement).style.visibility = "hidden";
  (document.getElementById("music") as HTMLAudioElement).play();

  game.init();
  requestAnimationFrame(game.animateAll);
}
