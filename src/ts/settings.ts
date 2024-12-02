export let shuffleCharacterLayers = true;
export let useInterpolation = false;
export let movementThreshold = 1;
export let speed = 200;

const shuffleLayersCheckbox: HTMLInputElement = document.getElementById(
  "shuffleLayersCheckbox",
) as HTMLInputElement;
const useInterpolationCheckbox: HTMLInputElement = document.getElementById(
  "useInterpolationCheckbox",
) as HTMLInputElement;
const movementThresholdField: HTMLInputElement = document.getElementById(
  "movementThresholdField",
) as HTMLInputElement;
const speedField: HTMLInputElement = document.getElementById(
  "speedField",
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
  const shuffleLayersValue = shuffleLayersCheckbox.checked;
  const useInterpolationValue = useInterpolationCheckbox.checked;
  const movementThresholdValue = parseFloat(movementThresholdField.value);
  const speedValue = parseFloat(speedField.value);

  shuffleCharacterLayers = shuffleLayersValue;
  useInterpolation = useInterpolationValue;

  if (!isNaN(movementThresholdValue) && !isNaN(speedValue)) {
    movementThreshold = movementThresholdValue;
    speed = speedValue;
  }
}
