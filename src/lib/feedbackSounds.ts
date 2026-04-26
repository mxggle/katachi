'use client';

class FeedbackSoundPlayer {
  private context: AudioContext | null = null;

  private init() {
    if (!this.context && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.context = new AudioCtx();
      }
    }
  }

  private resume() {
    if (this.context?.state === 'suspended') {
      void this.context.resume();
    }
  }

  playSuccess() {
    this.init();
    if (!this.context) return;
    this.resume();

    const now = this.context.currentTime;

    const playBell = (freq: number, startTime: number, volume: number) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      osc.connect(gain);
      gain.connect(this.context!.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    };

    // Harmonic success chime: E5 -> G5 -> C6
    playBell(659.25, now, 0.1);
    playBell(783.99, now + 0.05, 0.08);
    playBell(1046.50, now + 0.1, 0.06);
  }

  playError() {
    this.init();
    if (!this.context) return;
    this.resume();

    const now = this.context.currentTime;

    const playTap = (freq: number, startTime: number, volume: number) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      
      // Use triangle for a softer, more woodblock-like percussive hit
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + 0.08);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.context!.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.08);
    };

    // Minimalist "double tap" (sounds like a soft woodblock hit)
    playTap(180, now, 0.2); 
    playTap(140, now + 0.1, 0.15); 
  }

  playComplete() {
    this.init();
    if (!this.context) return;
    this.resume();

    const now = this.context.currentTime;
    
    const playNote = (freq: number, start: number, duration: number, volume: number = 0.1) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(this.context!.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Richer Arpeggio: C5, G5, C6, E6
    playNote(523.25, now, 0.6, 0.08);
    playNote(783.99, now + 0.1, 0.6, 0.07);
    playNote(1046.50, now + 0.2, 0.6, 0.06);
    playNote(1318.51, now + 0.3, 0.8, 0.05);
  }
}

export const feedbackSounds = new FeedbackSoundPlayer();
