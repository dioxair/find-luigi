type AudioKey =
  | "music"
  | "luigi_caught_1"
  | "luigi_caught_2"
  | "luigi_caught_3";

interface AudioConfig {
  url: string;
  loop?: boolean;
  volume?: number;
}

class AudioManager {
  private audioContext: AudioContext;
  private audioBuffers: Map<AudioKey, AudioBuffer> = new Map();
  private playingSources: Map<AudioKey, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<AudioKey, GainNode> = new Map();

  private audioManifest: Record<AudioKey, AudioConfig> = {
    music: { url: "audio/music.wav", loop: true, volume: 0.6 },
    luigi_caught_1: { url: "audio/luigi_caught_1.wav", volume: 1.0 },
    luigi_caught_2: { url: "audio/luigi_caught_2.wav", volume: 1.0 },
    luigi_caught_3: { url: "audio/luigi_caught_3.wav", volume: 1.0 },
  };

  constructor() {
    this.audioContext = new AudioContext();
  }

  public async loadAll(): Promise<void> {
    const entries = Object.entries(this.audioManifest) as [
      AudioKey,
      AudioConfig,
    ][];
    for (const [key, config] of entries) {
      try {
        const response = await fetch(config.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer =
          await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(key, audioBuffer);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = config.volume ?? 1.0;
        gainNode.connect(this.audioContext.destination);
        this.gainNodes.set(key, gainNode);
      } catch (error) {
        console.error(`Failed to load audio for key "${key}":`, error);
      }
    }
  }

  public async play(key: AudioKey): Promise<boolean> {
    const buffer = this.audioBuffers.get(key);
    const gainNode = this.gainNodes.get(key);
    if (!buffer || !gainNode) {
      console.warn(`Missing audio buffer or gain node for key "${key}".`);
      return false;
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = this.audioManifest[key].loop ?? false;
    source.connect(gainNode);
    source.start(0);

    if (source.loop) {
      this.stop(key);
      this.playingSources.set(key, source);
    }

    return true;
  }

  public stop(key: AudioKey): void {
    const source = this.playingSources.get(key);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        console.warn(`Failed to stop audio for key "${key}":`, e);
      }
      this.playingSources.delete(key);
    }
  }

  public mute(): void {
    this.audioContext.suspend();
  }

  public unmute(): void {
    this.audioContext.resume();
  }

  public setVolume(key: AudioKey, volume: number): void {
    const gainNode = this.gainNodes.get(key);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(volume, 1));
    }
  }

  public playRandomCaughtSound(): void {
    const keys: AudioKey[] = [
      "luigi_caught_1",
      "luigi_caught_2",
      "luigi_caught_3",
    ];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    this.play(randomKey);
  }
}

export default AudioManager;
