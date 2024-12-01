export let movementThreshold = 1;
export let speed = 200;

const movementThresholdField: HTMLInputElement = document.getElementById(
  "movementThresholdField",
) as HTMLInputElement;
const speedField: HTMLInputElement = document.getElementById("speedField") as HTMLInputElement;

export function applySettings() {
  const movementThresholdValue = parseFloat(movementThresholdField.value);
  const speedValue = parseFloat(speedField.value);

  if (!isNaN(movementThresholdValue) && !isNaN(speedValue)) {
    movementThreshold = movementThresholdValue;
    speed = speedValue;
  }
}
