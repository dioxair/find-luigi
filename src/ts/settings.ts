export let shuffleCharacterLayers = true;
export let useInterpolation = false;
export let showFPS = true;
export let movementThreshold = 1;
export let minIcons = 50;
export let maxIcons = 100;
export let speed = 200;

const shuffleLayersCheckbox: HTMLInputElement = document.getElementById(
  "shuffleLayersCheckbox",
) as HTMLInputElement;
const useInterpolationCheckbox: HTMLInputElement = document.getElementById(
  "useInterpolationCheckbox",
) as HTMLInputElement;
const showFPSCheckbox: HTMLInputElement = document.getElementById(
  "showFPSCheckbox",
) as HTMLInputElement;
const movementThresholdField: HTMLInputElement = document.getElementById(
  "movementThresholdField",
) as HTMLInputElement;
const minimumIconsField: HTMLInputElement = document.getElementById(
  "minimumIconsField",
) as HTMLInputElement;
const maximumIconsField: HTMLInputElement = document.getElementById(
  "maximumIconsField",
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
  const showFPSValue = showFPSCheckbox.checked;
  const movementThresholdValue = parseFloat(movementThresholdField.value);
  const minimumIconsValue = parseFloat(minimumIconsField.value);
  const maximumIconsValue = parseFloat(maximumIconsField.value);
  const speedValue = parseFloat(speedField.value);

  shuffleCharacterLayers = shuffleLayersValue;
  useInterpolation = useInterpolationValue;
  showFPS = showFPSValue;

  if (
    !isNaN(movementThresholdValue) &&
    !isNaN(speedValue) &&
    !isNaN(minimumIconsValue) &&
    !isNaN(maximumIconsValue)
  ) {
    movementThreshold = movementThresholdValue;
    minIcons = minimumIconsValue;
    maxIcons = maximumIconsValue;
    speed = speedValue;
  }
}
