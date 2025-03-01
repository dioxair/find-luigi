class AudioManager {
  private caughtSounds: HTMLAudioElement[];

  constructor() {
    this.caughtSounds = [
      new Audio("audio/luigi_caught_1.wav"),
      new Audio("audio/luigi_caught_2.wav"),
      new Audio("audio/luigi_caught_3.wav"),
    ];
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

  public playRandomCaughtSound(): boolean {
    const result = this.playAudio(this.getRandomCaughtSound());
    return result ? true : false;
  }
}

export default AudioManager;
