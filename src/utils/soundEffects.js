/**
 * Sound effect utilities for the Fruit Match game
 */

// Map of sound names to their file paths
const SOUND_PATHS = {
    match: '/assets/sounds/match.mp3',
    select: '/assets/sounds/select.mp3',
    swap: '/assets/sounds/swap.mp3',
    invalid: '/assets/sounds/invalid.mp3',
    levelComplete: '/assets/sounds/level-complete.mp3',
    star: '/assets/sounds/star.mp3',
    hint: '/assets/sounds/hint.mp3',
    shuffle: '/assets/sounds/shuffle.mp3',
    gameOver: '/assets/sounds/game-over.mp3',
    buttonClick: '/assets/sounds/button-click.mp3'
  };
  
  // Cache for preloaded audio objects
  const audioCache = {};
  
  // Preload sounds for better performance
  export const preloadSounds = () => {
    for (const [key, path] of Object.entries(SOUND_PATHS)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audioCache[key] = audio;
      
      // Create a duplicate for overlapping sounds
      const audioDuplicate = new Audio(path);
      audioDuplicate.preload = 'auto';
      audioCache[`${key}_duplicate`] = audioDuplicate;
    }
  };
  
  // Check if an audio is currently playing
  const isPlaying = (audio) => {
    return !audio.paused && !audio.ended && audio.currentTime > 0;
  };
  
  // Play a sound by name
  export const playSound = (soundName, volume = 1.0) => {
    // Check if sound is enabled in user settings
    if (localStorage.getItem('soundEnabled') === 'false') {
      return;
    }
    
    if (!SOUND_PATHS[soundName]) {
      console.warn(`Sound '${soundName}' not found`);
      return;
    }
    
    // Get the audio from cache or create a new one
    let audio = audioCache[soundName];
    
    // If the primary audio is playing, use the duplicate
    if (audio && isPlaying(audio)) {
      audio = audioCache[`${soundName}_duplicate`];
    }
    
    // If still no audio or it's also playing, create a temporary one
    if (!audio || isPlaying(audio)) {
      audio = new Audio(SOUND_PATHS[soundName]);
    }
    
    // Set volume
    audio.volume = volume;
    
    // Play the sound
    audio.play().catch(error => {
      // Common error in browsers that require user interaction before playing audio
      console.warn(`Error playing sound '${soundName}':`, error);
    });
    
    return audio;
  };
  
  // Stop a currently playing sound
  export const stopSound = (soundName) => {
    const audio = audioCache[soundName];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    const audioDuplicate = audioCache[`${soundName}_duplicate`];
    if (audioDuplicate) {
      audioDuplicate.pause();
      audioDuplicate.currentTime = 0;
    }
  };
  
  // Play a sequence of sounds with delays
  export const playSoundSequence = (soundNames, delayBetween = 200) => {
    if (!soundNames || soundNames.length === 0) return;
    
    let delay = 0;
    
    soundNames.forEach(soundName => {
      setTimeout(() => {
        playSound(soundName);
      }, delay);
      
      delay += delayBetween;
    });
  };
  
  // Play a sound with special effects (pitch shift, rate, etc.)
  export const playSoundWithEffects = (soundName, effects = {}) => {
    const { rate = 1.0, volume = 1.0 } = effects;
    
    // Check if the Web Audio API is supported
    if (!window.AudioContext && !window.webkitAudioContext) {
      // Fallback to basic audio
      return playSound(soundName, volume);
    }
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Get the audio from cache or create a new one
    let audio = audioCache[soundName];
    
    if (!audio) {
      audio = new Audio(SOUND_PATHS[soundName]);
      audioCache[soundName] = audio;
    }
    
    // Clone the audio to avoid affecting the cached version
    const audioClone = audio.cloneNode();
    
    // Create a source node
    const source = audioContext.createMediaElementSource(audioClone);
    
    // Create a gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    
    // Connect the nodes
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set playback rate (affects pitch and speed together)
    audioClone.playbackRate = rate;
    
    // Play the sound
    audioClone.play().catch(error => {
      console.warn(`Error playing sound with effects '${soundName}':`, error);
    });
    
    return audioClone;
  };
  
  // Control background music
  let backgroundMusic = null;
  let isMusicPlaying = false;
  
  export const playBackgroundMusic = (musicPath = '/assets/sounds/background-music.mp3', volume = 0.5) => {
    // Check if music is enabled in user settings
    if (localStorage.getItem('musicEnabled') === 'false') {
      return;
    }
    
    // Stop any existing music
    stopBackgroundMusic();
    
    // Create new audio for background music
    backgroundMusic = new Audio(musicPath);
    backgroundMusic.loop = true;
    backgroundMusic.volume = volume;
    
    // Play the music
    backgroundMusic.play().then(() => {
      isMusicPlaying = true;
    }).catch(error => {
      console.warn('Error playing background music:', error);
    });
    
    return backgroundMusic;
  };
  
  export const stopBackgroundMusic = () => {
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      isMusicPlaying = false;
    }
  };
  
  export const pauseBackgroundMusic = () => {
    if (backgroundMusic && isMusicPlaying) {
      backgroundMusic.pause();
      isMusicPlaying = false;
    }
  };
  
  export const resumeBackgroundMusic = () => {
    if (backgroundMusic && !isMusicPlaying) {
      backgroundMusic.play().then(() => {
        isMusicPlaying = true;
      }).catch(error => {
        console.warn('Error resuming background music:', error);
      });
    }
  };
  
  export const setMusicVolume = (volume) => {
    if (backgroundMusic) {
      backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }
  };
  
  // Toggle sound effects on/off
  export const toggleSound = () => {
    const currentSetting = localStorage.getItem('soundEnabled');
    const newSetting = currentSetting === 'false' ? 'true' : 'false';
    localStorage.setItem('soundEnabled', newSetting);
    return newSetting === 'true';
  };
  
  // Toggle background music on/off
  export const toggleMusic = () => {
    const currentSetting = localStorage.getItem('musicEnabled');
    const newSetting = currentSetting === 'false' ? 'true' : 'false';
    localStorage.setItem('musicEnabled', newSetting);
    
    if (newSetting === 'true') {
      resumeBackgroundMusic();
    } else {
      pauseBackgroundMusic();
    }
    
    return newSetting === 'true';
  };