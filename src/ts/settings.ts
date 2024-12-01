export let movementThreshold = 1;
export let speed = 200;
export let shuffleCharacterLayers = true;

const movementThresholdField: HTMLInputElement = document.getElementById(
  "movementThresholdField",
) as HTMLInputElement;
const speedField: HTMLInputElement = document.getElementById(
  "speedField",
) as HTMLInputElement;
const shuffleLayersCheckbox: HTMLInputElement = document.getElementById(
  "shuffleLayersCheckbox",
) as HTMLInputElement;

export function applySettings() {
  const movementThresholdValue = parseFloat(movementThresholdField.value);
  const speedValue = parseFloat(speedField.value);
  const shuffleLayersValue = shuffleLayersCheckbox.checked;

  if (!isNaN(movementThresholdValue) && !isNaN(speedValue)) {
    movementThreshold = movementThresholdValue;
    speed = speedValue;
  }

  shuffleCharacterLayers = shuffleLayersValue;
}
