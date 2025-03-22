export type Settings = {
  useMario: boolean;
  useWario: boolean;
  useYoshi: boolean;
  shuffleCharacterLayers: boolean;
  useInterpolation: boolean;
  showFPS: boolean;
  music: boolean;
  SFX: boolean;
  movementThreshold: number;
  minIcons: number;
  maxIcons: number;
  speed: number;
};

type InputElements = { [Key in keyof Settings]: HTMLInputElement };

const settingsDefaults: Settings = {
  useMario: true,
  useWario: true,
  useYoshi: false,
  shuffleCharacterLayers: true,
  useInterpolation: false,
  showFPS: true,
  music: true,
  SFX: true,
  movementThreshold: 1,
  minIcons: 50,
  maxIcons: 100,
  speed: 400,
};

export class SettingsManager {
  private settings: Settings;
  private inputElements: InputElements;
  private speedLabel: HTMLLabelElement;

  constructor(private storage: Storage = localStorage) {
    this.inputElements = this.getInputElements();
    this.settings = this.loadSettings();
    this.speedLabel = document.getElementById(
      "speedFieldLabel",
    ) as HTMLLabelElement;
    this.applyUIValues();
    this.setupEventListeners();
  }

  private getInputElements(): InputElements {
    return {
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
      SFX: document.getElementById("sfxCheckbox") as HTMLInputElement,
      movementThreshold: document.getElementById(
        "movementThresholdField",
      ) as HTMLInputElement,
      minIcons: document.getElementById(
        "minimumIconsField",
      ) as HTMLInputElement,
      maxIcons: document.getElementById(
        "maximumIconsField",
      ) as HTMLInputElement,
      speed: document.getElementById("speedField") as HTMLInputElement,
    };
  }

  private loadSettings(): Settings {
    return Object.fromEntries(
      Object.entries(settingsDefaults).map(([key, defaultValue]) => [
        key,
        this.getAndParseLocalStorage(
          key,
          typeof defaultValue === "boolean" ? this.parseBoolean : parseInt,
          defaultValue,
        ),
      ]),
    ) as Settings;
  }

  private applyUIValues(): void {
    Object.entries(this.inputElements).forEach(([key, element]) => {
      const settingKey = key as keyof Settings;
      if (typeof this.settings[settingKey] === "boolean") {
        element.checked = this.settings[settingKey] as boolean;
      } else {
        element.value = this.settings[settingKey].toString();
      }
    });
    this.updateSpeedLabel();
  }

  private setupEventListeners(): void {
    this.inputElements.speed.addEventListener("input", () => {
      this.updateSpeedLabel();
      const speedValue = parseInt(this.inputElements.speed.value);
      if (!isNaN(speedValue)) {
        this.settings.speed = speedValue;
      }
    });
  }

  private updateSpeedLabel(): void {
    this.speedLabel.childNodes[0].textContent = `Speed (value: ${this.inputElements.speed.value})`;
  }

  private setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    this.settings[key] = value;
  }

  public applySettings(): void {
    Object.entries(this.inputElements).forEach(([key, element]) => {
      const settingKey = key as keyof Settings;

      if (typeof settingsDefaults[settingKey] === "boolean") {
        this.setSetting(settingKey, element.checked as boolean);
      } else if (typeof settingsDefaults[settingKey] === "number") {
        const value = parseInt(element.value, 10);
        if (!isNaN(value)) {
          this.setSetting(settingKey, value as number);
        }
      }
      this.storage.setItem(settingKey, this.settings[settingKey].toString());
    });

    window.location.reload();
  }

  private getAndParseLocalStorage<T>(
    key: string,
    parseFn: (value: string) => T,
    defaultValue: T,
  ): T {
    const value = this.storage.getItem(key);
    return value !== null ? parseFn(value) : defaultValue;
  }

  private parseBoolean(value?: string | number | boolean | null): boolean {
    return value?.toString().toLowerCase() === "true" || value === "1";
  }

  public getSettings(): Settings {
    return this.settings;
  }
}
