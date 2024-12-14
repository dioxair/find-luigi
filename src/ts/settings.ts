type Settings = {
  useMario: boolean;
  useWario: boolean;
  useYoshi: boolean;
  shuffleCharacterLayers: boolean;
  useInterpolation: boolean;
  showFPS: boolean;
  music: boolean;
  movementThreshold: number;
  minIcons: number;
  maxIcons: number;
  speed: number;
};

type InputElements = {
  [Key in keyof Settings]: HTMLInputElement;
};

const settingsDefaults: Settings = {
  useMario: true,
  useWario: true,
  useYoshi: false,
  shuffleCharacterLayers: true,
  useInterpolation: false,
  showFPS: true,
  music: true,
  movementThreshold: 1,
  minIcons: 50,
  maxIcons: 100,
  speed: 400,
};

const inputElements: InputElements = {
  useMario: document.getElementById("useMarioCheckbox") as HTMLInputElement,
  useWario: document.getElementById("useWarioCheckbox") as HTMLInputElement,
  useYoshi: document.getElementById("useYoshiCheckbox") as HTMLInputElement,
  shuffleCharacterLayers: document.getElementById(
    "shuffleLayersCheckbox",
  ) as HTMLInputElement,
  useInterpolation: document.getElementById(
    "useInterpolationCheckbox",
  ) as HTMLInputElement,
  showFPS: document.getElementById("showFPSCheckbox") as HTMLInputElement,
  music: document.getElementById("musicCheckbox") as HTMLInputElement,
  movementThreshold: document.getElementById(
    "movementThresholdField",
  ) as HTMLInputElement,
  minIcons: document.getElementById("minimumIconsField") as HTMLInputElement,
  maxIcons: document.getElementById("maximumIconsField") as HTMLInputElement,
  speed: document.getElementById("speedField") as HTMLInputElement,
};

const settings: Settings = Object.fromEntries(
  Object.entries(settingsDefaults).map(([key, defaultValue]) => [
    key,
    getAndParseLocalStorage(
      key,
      typeof defaultValue === "boolean" ? parseBoolean : parseInt,
      defaultValue,
    ),
  ]),
) as Settings;

Object.entries(inputElements).forEach(([key, element]) => {
  const settingKey = key as keyof Settings;
  if (typeof settings[settingKey] === "boolean") {
    element.checked = settings[settingKey] as boolean;
  } else {
    element.value = settings[settingKey].toString();
  }
});

const speedFieldLabel = document.getElementById(
  "speedFieldLabel",
) as HTMLLabelElement;
updateSpeedLabel();

inputElements.speed.addEventListener("input", () => {
  updateSpeedLabel();
  const speedValue = parseInt(inputElements.speed.value);
  if (!isNaN(speedValue)) {
    settings.speed = speedValue;
  }
});

function updateSpeedLabel() {
  speedFieldLabel.childNodes[0].textContent = `Speed (value: ${inputElements.speed.value})`;
}

function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  settings[key] = value;
}

export function applySettings() {
  Object.entries(inputElements).forEach(([key, element]) => {
    const settingKey = key as keyof Settings;

    if (typeof settingsDefaults[settingKey] === "boolean") {
      setSetting(settingKey, element.checked as boolean);
    } else if (typeof settingsDefaults[settingKey] === "number") {
      const value = parseInt(element.value, 10);
      if (!isNaN(value)) {
        setSetting(settingKey, value as number);
      }
    }

    localStorage.setItem(settingKey, settings[settingKey].toString());
  });
}

function getAndParseLocalStorage<T>(
  key: string,
  parseFn: (value: string) => T,
  defaultValue: T,
): T {
  const value = localStorage.getItem(key);
  return value !== null ? parseFn(value) : defaultValue;
}

function parseBoolean(value?: string | number | boolean | null): boolean {
  return value?.toString().toLowerCase() === "true" || value === "1";
}

export { settings };
