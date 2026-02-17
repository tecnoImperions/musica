// ============================================
// BACKGROUND PLAYER - Estado Global Singleton
// ============================================

class BackgroundPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentSong = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 0.7;
    this.listeners = [];
    
    this.audio.volume = this.volume;
    
    // Event listeners del audio
    this.audio.addEventListener('play', () => this.handlePlay());
    this.audio.addEventListener('pause', () => this.handlePause());
    this.audio.addEventListener('timeupdate', () => this.handleTimeUpdate());
    this.audio.addEventListener('loadedmetadata', () => this.handleLoadedMetadata());
    this.audio.addEventListener('ended', () => this.handleEnded());
    
    // Cargar estado desde localStorage
    this.loadState();
  }
  
  // ============================================
  // MÉTODOS DE REPRODUCCIÓN
  // ============================================
  
  async loadSong(song) {
    this.currentSong = song;
    this.audio.src = song.audio_url;
    this.saveState();
    this.notifyListeners();
  }
  
  play() {
    return this.audio.play();
  }
  
  pause() {
    this.audio.pause();
  }
  
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  
  seek(time) {
    this.audio.currentTime = time;
  }
  
  setVolume(volume) {
    this.volume = volume;
    this.audio.volume = volume;
    this.saveState();
  }
  
  stop() {
    this.pause();
    this.currentSong = null;
    this.audio.src = '';
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    localStorage.removeItem('backgroundPlayerState');
    this.notifyListeners();
  }
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  handlePlay() {
    this.isPlaying = true;
    this.notifyListeners();
  }
  
  handlePause() {
    this.isPlaying = false;
    this.notifyListeners();
  }
  
  handleTimeUpdate() {
    this.currentTime = this.audio.currentTime;
    this.duration = this.audio.duration || 0;
    // Guardar estado cada 5 segundos para no saturar localStorage
    if (Math.floor(this.currentTime) % 5 === 0) {
      this.saveState();
    }
    this.notifyListeners();
  }
  
  handleLoadedMetadata() {
    this.duration = this.audio.duration;
    this.notifyListeners();
  }
  
  handleEnded() {
    this.isPlaying = false;
    this.notifyListeners();
    // Disparar evento global para que otras páginas puedan reaccionar
    window.dispatchEvent(new CustomEvent('backgroundPlayerEnded'));
  }
  
  // ============================================
  // ESTADO Y PERSISTENCIA
  // ============================================
  
  saveState() {
    if (!this.currentSong) return;
    const state = {
      songId: this.currentSong?.id,
      song: this.currentSong,
      currentTime: this.currentTime,
      volume: this.volume,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('backgroundPlayerState', JSON.stringify(state));
    } catch (err) {
      console.warn('Could not save player state:', err);
    }
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem('backgroundPlayerState');
      if (saved) {
        const state = JSON.parse(saved);
        
        // Solo restaurar si es reciente (menos de 1 hora)
        if (Date.now() - state.timestamp < 3600000) {
          this.currentTime = state.currentTime || 0;
          this.volume = state.volume || 0.7;
          this.audio.volume = this.volume;
          
          // Restaurar canción si existe
          if (state.song) {
            this.currentSong = state.song;
            this.audio.src = state.song.audio_url;
            this.audio.currentTime = this.currentTime;
          }
          
          return state.songId;
        }
      }
    } catch (err) {
      console.error('Error loading state:', err);
    }
    return null;
  }
  
  // ============================================
  // LISTENERS (Observer Pattern)
  // ============================================
  
  addListener(callback) {
    this.listeners.push(callback);
    // Notificar inmediatamente con el estado actual
    callback(this.getState());
  }
  
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }
  
  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (err) {
        console.error('Error in listener:', err);
      }
    });
  }
  
  getState() {
    return {
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume
    };
  }
}

// Instancia global única (Singleton)
const backgroundPlayer = new BackgroundPlayer();

export default backgroundPlayer;