class AudioManager {
  private caughtSounds: HTMLAudioElement[];
  private music: HTMLAudioElement;

  constructor() {
    this.caughtSounds = [
      new Audio("audio/luigi_caught_1.wav"),
      new Audio("audio/luigi_caught_2.wav"),
      new Audio("audio/luigi_caught_3.wav"),
    ];

    this.music = new Audio("audio/music.wav");
    this.music.loop = true;
  }

  public playRandomCaughtSound(): boolean {
    const result = this.playAudio(this.getRandomCaughtSound());
    return result ? true : false;
  }

  public muteMusic(): boolean {
    const result = this.muteAudio(this.music);
    return result ? true : false;
  }

  public playMusic(): boolean {
    const result = this.playAudio(this.music);
    return result ? true : false;
  }

  private getRandomCaughtSound(): HTMLAudioElement {
    const audioIndex = Math.floor(Math.random() * this.caughtSounds.length);
    return this.caughtSounds[audioIndex];
  }

  private playAudio(audio: HTMLAudioElement): boolean {
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
      return false;
    });

    return true;
  }

  private muteAudio(audio: HTMLAudioElement): boolean {
    audio.muted = true;
    return audio.muted === true;
  }
}

export default AudioManager;
