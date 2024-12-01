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

speedField.addEventListener("input", function () {
  const speedValue = parseFloat(speedField.value);
  if (!isNaN(speedValue)) {
    const speedFieldLabel: HTMLLabelElement = document.getElementById(
      "speedFieldLabel",
    ) as HTMLLabelElement;
    speedFieldLabel.childNodes[0].textContent = `Speed (value: ${speedField.value})`;
    speed = speedValue;
  }
});

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
