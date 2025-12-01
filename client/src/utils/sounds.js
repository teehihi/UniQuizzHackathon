// Sound effects and background music for multiplayer
class SoundManager {
  constructor() {
    this.sounds = {};
    this.bgMusic = null;
    this.isMuted = localStorage.getItem('soundMuted') === 'true';
  }

  // Initialize sounds
  init() {
    // Background music (using Web Audio API to generate simple tones)
    this.createBackgroundMusic();
    
    // Sound effects using Audio API with data URIs (simple beeps)
    this.sounds = {
      join: this.createBeep(800, 0.1, 'sine'),
      leave: this.createBeep(400, 0.1, 'sine'),
      start: this.createBeep(1000, 0.2, 'square'),
      correct: this.createBeep(1200, 0.15, 'sine'),
      wrong: this.createBeep(300, 0.2, 'sawtooth'),
      tick: this.createBeep(600, 0.05, 'sine'),
      finish: this.createBeep(1500, 0.3, 'triangle'),
    };
  }

  // Create simple beep sound
  createBeep(frequency, duration, type = 'sine') {
    return () => {
      if (this.isMuted) return;
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        // Silently fail if audio context not available
        console.error('Audio error:', error);
      }
    };
  }

  // Create background music (simple melody loop)
  createBackgroundMusic() {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99]; // C, D, E, F, G
    let currentNote = 0;

    this.bgMusic = {
      interval: null,
      start: () => {
        if (this.isMuted || this.bgMusic.interval) return;
        
        this.bgMusic.interval = setInterval(() => {
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = notes[currentNote];
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            currentNote = (currentNote + 1) % notes.length;
          } catch (error) {
            // Silently fail
          }
        }, 500);
      },
      stop: () => {
        if (this.bgMusic.interval) {
          clearInterval(this.bgMusic.interval);
          this.bgMusic.interval = null;
        }
      }
    };
  }

  // Play sound effect
  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }

  // Start background music
  startMusic() {
    if (this.bgMusic) {
      this.bgMusic.start();
    }
  }

  // Stop background music
  stopMusic() {
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('soundMuted', this.isMuted);
    
    if (this.isMuted) {
      this.stopMusic();
    }
    
    return this.isMuted;
  }

  // Get mute status
  getMuted() {
    return this.isMuted;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
soundManager.init();
