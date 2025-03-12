export const useHapticFeedback = () => {
    const isVibrationSupported = () => {
      return 'vibrate' in navigator;
    };
    
    const vibrate = (pattern) => {
      if (isVibrationSupported()) {
        navigator.vibrate(pattern);
      }
    };
    
    // Different vibration patterns
    const patterns = {
      match: [30], // Short pulse
      invalidMove: [10, 30, 10], // Error pattern
      levelComplete: [100, 50, 100, 50, 100], // Success pattern
      starEarned: [50, 20, 100] // Star earned pattern
    };
    
    return {
      vibrateMatch: () => vibrate(patterns.match),
      vibrateInvalidMove: () => vibrate(patterns.invalidMove),
      vibrateLevelComplete: () => vibrate(patterns.levelComplete),
      vibrateStarEarned: () => vibrate(patterns.starEarned)
    };
  };