export let useMario: boolean = getAndParseLocalStorage(
  "useMario",
  parseBoolean,
  true,
);
export let useWario: boolean = getAndParseLocalStorage(
  "useWario",
  parseBoolean,
  true,
);
export let useYoshi: boolean = getAndParseLocalStorage(
  "useYoshi",
  parseBoolean,
  false,
);

export let shuffleCharacterLayers: boolean = getAndParseLocalStorage(
  "shuffleCharacterLayers",
  parseBoolean,
  true,
);
export let useInterpolation: boolean = getAndParseLocalStorage(
  "useInterpolation",
  parseBoolean,
  false,
);
export let showFPS: boolean = getAndParseLocalStorage(
  "showFPS",
  parseBoolean,
  true,
);
export let music: boolean = getAndParseLocalStorage(
  "music",
  parseBoolean,
  true,
);
export let movementThreshold: number = getAndParseLocalStorage(
  "movementThreshold",
  parseInt,
  1,
);
export let minIcons: number = getAndParseLocalStorage(
  "minimumIcons",
  parseInt,
  150,
);
export let maxIcons: number = getAndParseLocalStorage(
  "maximumIcons",
  parseInt,
  200,
);
export let speed: number = getAndParseLocalStorage("speed", parseInt, 200);

const useMarioCheckbox: HTMLInputElement = document.getElementById(
  "useMarioCheckbox",
) as HTMLInputElement;
const useWarioCheckbox: HTMLInputElement = document.getElementById(
  "useWarioCheckbox",
) as HTMLInputElement;
const useYoshiCheckbox: HTMLInputElement = document.getElementById(
  "useYoshiCheckbox",
) as HTMLInputElement;

const shuffleLayersCheckbox: HTMLInputElement = document.getElementById(
  "shuffleLayersCheckbox",
) as HTMLInputElement;
const useInterpolationCheckbox: HTMLInputElement = document.getElementById(
  "useInterpolationCheckbox",
) as HTMLInputElement;
const showFPSCheckbox: HTMLInputElement = document.getElementById(
  "showFPSCheckbox",
) as HTMLInputElement;
const musicCheckbox: HTMLInputElement = document.getElementById(
  "musicCheckbox",
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

useMarioCheckbox.checked = useMario;
useWarioCheckbox.checked = useWario;
useYoshiCheckbox.checked = useYoshi;

shuffleLayersCheckbox.checked = shuffleCharacterLayers;
useInterpolationCheckbox.checked = useInterpolation;
showFPSCheckbox.checked = showFPS;
musicCheckbox.checked = music;
movementThresholdField.value = movementThreshold.toString();
minimumIconsField.value = minIcons.toString();
maximumIconsField.value = maxIcons.toString();
speedField.value = speed.toString();
const speedFieldLabel: HTMLLabelElement = document.getElementById(
  "speedFieldLabel",
) as HTMLLabelElement;
speedFieldLabel.childNodes[0].textContent = `Speed (value: ${speedField.value})`;

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
  const useMarioValue = useMarioCheckbox.checked;
  const useWarioValue = useWarioCheckbox.checked;
  const useYoshiValue = useYoshiCheckbox.checked;

  const shuffleLayersValue = shuffleLayersCheckbox.checked;
  const useInterpolationValue = useInterpolationCheckbox.checked;
  const showFPSValue = showFPSCheckbox.checked;
  const musicValue = musicCheckbox.checked;
  const movementThresholdValue = parseInt(movementThresholdField.value);
  const minimumIconsValue = parseInt(minimumIconsField.value);
  const maximumIconsValue = parseInt(maximumIconsField.value);
  const speedValue = parseInt(speedField.value);

  useMario = useMarioValue;
  useWario = useWarioValue;
  useYoshi = useYoshiValue;

  shuffleCharacterLayers = shuffleLayersValue;
  useInterpolation = useInterpolationValue;
  showFPS = showFPSValue;
  music = musicValue;

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

  localStorage.setItem("useMario", useMarioValue.toString());
  localStorage.setItem("useWario", useWarioValue.toString());
  localStorage.setItem("useYoshi", useYoshiValue.toString());

  localStorage.setItem("shuffleCharacterLayers", shuffleLayersValue.toString());
  localStorage.setItem("useInterpolation", useInterpolationValue.toString());
  localStorage.setItem("showFPS", showFPSValue.toString());
  localStorage.setItem("music", musicValue.toString());
  localStorage.setItem("movementThreshold", movementThresholdValue.toString());
  localStorage.setItem("minimumIcons", minimumIconsValue.toString());
  localStorage.setItem("maximumIcons", maximumIconsValue.toString());
  localStorage.setItem("speed", speedValue.toString());
}

function getAndParseLocalStorage<T>(
  key: string,
  parseFn: (value: string) => T,
  defaultValue: T,
): T {
  const value = localStorage.getItem(key);
  return value !== null ? parseFn(value) : defaultValue;
}

function parseBoolean(value?: string | number | boolean | null) {
  value = value?.toString().toLowerCase();
  return value === "true" || value === "1";
}
