/**
 * Haptic feedback utilities for the Fruit Match game on mobile devices
 * Uses the Vibration API to provide tactile feedback for game events
 */

// Check if vibration is supported on the device
const isVibrationSupported = () => {
    return 'vibrate' in navigator;
  };
  
  // Vibration patterns (in milliseconds)
  const VIBRATION_PATTERNS = {
    // Short gentle buzz for selection
    select: [40],
    
    // Double buzz for successful match
    match: [30, 50, 60],
    
    // Triple pulse for special match (4+ fruits)
    specialMatch: [20, 40, 50, 40, 60],
    
    // Long buzz for invalid move
    invalidMove: [150],
    
    // Sequence of pulses for level complete
    levelComplete: [50, 100, 50, 100, 150],
    
    // Medium pulse for star earned
    starEarned: [80, 50, 120],
    
    // Short quick pulses for hint
    hint: [20, 30, 20],
    
    // Medium buzz for board shuffle
    shuffle: [100],
    
    // Success pattern for wallet connected
    walletConnected: [30, 50, 100],
    
    // Failure pattern for wallet connection error
    walletError: [100, 100, 100],
    
    // Button click feedback
    buttonClick: [20]
  };
  
  /**
   * Triggers haptic feedback with the specified pattern
   * @param {Array|number} pattern - Vibration pattern in milliseconds or pattern array
   */
  const vibrate = (pattern) => {
    if (!isVibrationSupported()) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  };
  
  /**
   * Custom hook for haptic feedback in the game
   * @param {boolean} enabled - Whether haptic feedback is enabled
   * @returns {Object} - Object containing vibration functions for different game events
   */
  export const useHapticFeedback = (enabled = true) => {
    // Read user preference from localStorage or use default
    const isHapticsEnabled = () => {
      const storedPreference = localStorage.getItem('hapticsEnabled');
      return storedPreference === null ? enabled : storedPreference === 'true';
    };
    
    // Toggle haptics setting
    const toggleHaptics = () => {
      const newSetting = !isHapticsEnabled();
      localStorage.setItem('hapticsEnabled', newSetting);
      return newSetting;
    };
    
    // Vibration function with check for user preference
    const vibrateIfEnabled = (pattern) => {
      if (isHapticsEnabled()) {
        vibrate(pattern);
      }
    };
    
    return {
      // Game action haptics
      vibrateSelect: () => vibrateIfEnabled(VIBRATION_PATTERNS.select),
      vibrateMatch: () => vibrateIfEnabled(VIBRATION_PATTERNS.match),
      vibrateSpecialMatch: () => vibrateIfEnabled(VIBRATION_PATTERNS.specialMatch),
      vibrateInvalidMove: () => vibrateIfEnabled(VIBRATION_PATTERNS.invalidMove),
      vibrateLevelComplete: () => vibrateIfEnabled(VIBRATION_PATTERNS.levelComplete),
      vibrateStarEarned: () => vibrateIfEnabled(VIBRATION_PATTERNS.starEarned),
      vibrateHint: () => vibrateIfEnabled(VIBRATION_PATTERNS.hint),
      vibrateShuffle: () => vibrateIfEnabled(VIBRATION_PATTERNS.shuffle),
      
      // UI action haptics
      vibrateButtonClick: () => vibrateIfEnabled(VIBRATION_PATTERNS.buttonClick),
      vibrateWalletConnected: () => vibrateIfEnabled(VIBRATION_PATTERNS.walletConnected),
      vibrateWalletError: () => vibrateIfEnabled(VIBRATION_PATTERNS.walletError),
      
      // Custom vibration
      vibrateCustom: (pattern) => vibrateIfEnabled(pattern),
      
      // Settings
      isHapticsEnabled,
      toggleHaptics,
      isSupported: isVibrationSupported()
    };
  };
  
  /**
   * Function to initialize haptic feedback by doing a quick check
   * Call this early in the app initialization to resolve permission issues on some devices
   */
  export const initializeHaptics = () => {
    if (isVibrationSupported()) {
      // Short, nearly imperceptible test vibration
      vibrate(1);
    }
  };
  
  /**
   * Returns appropriate haptic feedback strength based on device type and OS
   * Useful for adjusting patterns at runtime for different devices
   */
  export const getHapticStrength = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // iOS devices generally have stronger haptics
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'medium';
    }
    
    // High-end Android devices often have good haptics
    if (/samsung|pixel|oneplus/.test(userAgent)) {
      return 'strong';
    }
    
    // Default for other devices
    return 'normal';
  };
  
  /**
   * Helper to scale vibration patterns based on device strength
   * @param {Array} pattern - The vibration pattern to scale
   * @param {string} strength - The device strength category
   * @returns {Array} - Scaled vibration pattern
   */
  export const scaleVibrationPattern = (pattern, strength = getHapticStrength()) => {
    const strengthMultipliers = {
      'weak': 1.5,    // Increase duration for weak haptics
      'normal': 1.0,  // Standard
      'medium': 0.8,  // Reduce for medium strength devices
      'strong': 0.6   // Reduce for strong haptic devices
    };
    
    const multiplier = strengthMultipliers[strength] || 1.0;
    
    return pattern.map(duration => Math.round(duration * multiplier));
  };