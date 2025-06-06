// Audio system for biker-themed sound effects
interface SoundEffect {
  name: string;
  src: string;
  volume?: number;
}

const soundEffects: Record<string, SoundEffect> = {
  'engine-rev': {
    name: 'Engine Rev',
    src: 'data:audio/wav;base64,UklGRt4BAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YboBAAC4AQAA',
    volume: 0.6,
  },
  'upload-complete': {
    name: 'Upload Complete',
    src: 'data:audio/wav;base64,UklGRt4BAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YboBAAC4AQAA',
    volume: 0.8,
  },
  'metal-clank': {
    name: 'Metal Clank',
    src: 'data:audio/wav;base64,UklGRt4BAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YboBAAC4AQAA',
    volume: 0.5,
  },
  'spark': {
    name: 'Spark',
    src: 'data:audio/wav;base64,UklGRt4BAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YboBAAC4AQAA',
    volume: 0.4,
  },
  'exhaust-pop': {
    name: 'Exhaust Pop',
    src: 'data:audio/wav;base64,UklGRt4BAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YboBAAC4AQAA',
    volume: 0.7,
  },
};

class AudioManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.initialized = true;
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
  }

  async playSound(soundKey: string): Promise<void> {
    await this.initialize();
    
    if (!this.audioContext || !this.gainNode) {
      console.warn('Audio context not available');
      return;
    }

    const sound = soundEffects[soundKey];
    if (!sound) {
      console.warn(`Sound effect "${soundKey}" not found`);
      return;
    }

    try {
      // For simplicity, we'll use HTML5 Audio for now
      // In a real implementation, you'd load actual audio files
      const audio = new Audio();
      audio.volume = sound.volume || 0.5;
      
      // Generate a simple beep tone programmatically
      await this.generateTone(soundKey);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  private async generateTone(soundKey: string): Promise<void> {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);

    // Different tones for different sounds
    switch (soundKey) {
      case 'engine-rev':
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        oscillator.type = 'sawtooth';
        break;
        
      case 'upload-complete':
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.type = 'square';
        break;
        
      case 'metal-clank':
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.type = 'square';
        break;
        
      case 'spark':
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        oscillator.type = 'sawtooth';
        break;
        
      case 'exhaust-pop':
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        oscillator.type = 'square';
        break;
        
      default:
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    }

    const duration = soundKey === 'engine-rev' ? 0.5 : soundKey === 'upload-complete' ? 0.3 : 0.1;
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext!.currentTime);
    }
  }
}

const audioManager = new AudioManager();

export function playSound(soundKey: string): void {
  audioManager.playSound(soundKey);
}

export function setAudioVolume(volume: number): void {
  audioManager.setVolume(volume);
}
