import { useContext } from 'react';
import { SoundContext } from '../contexts/SoundContext';

export const useSoundEffects = () => {
  const { soundEnabled } = useContext(SoundContext);
  
  const sounds = {
    match: '/assets/sounds/match.mp3',
    swap: '/assets/sounds/swap.mp3',
    levelComplete: '/assets/sounds/level-complete.mp3',
    star: '/assets/sounds/star.mp3',
    invalid: '/assets/sounds/invalid.mp3'
  };
  
  const playSound = (soundName) => {
    if (!soundEnabled) return;
    
    const audio = new Audio(sounds[soundName]);
    audio.volume = 0.5; // Adjust volume as needed
    audio.play().catch(e => console.log('Sound play error:', e));
  };
  
  return { playSound };
};