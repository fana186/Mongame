import React, { useEffect } from 'react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

const VictoryScreen = ({ 
  isVisible, 
  score, 
  stars, 
  onNextLevel, 
  onReplay, 
  onClose,
  currentLevel
}) => {
  const { playSound } = useSoundEffects();
  const { vibrateLevelComplete } = useHapticFeedback();

  useEffect(() => {
    if (isVisible) {
      playSound('levelComplete');
      vibrateLevelComplete();
    }
  }, [isVisible, playSound, vibrateLevelComplete]);

  if (!isVisible) return null;

  // Determine message based on stars earned
  const getMessage = () => {
    if (stars === 3) return "Perfect!";
    if (stars === 2) return "Great job!";
    if (stars === 1) return "Level cleared!";
    return "Try again!";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
      <div 
        className="relative p-8 rounded-2xl max-w-md w-full text-center animate-scaleIn"
        style={{
          backgroundImage: "url('/assets/ui/victory-panel.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: "400px",
          width: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <h2 className="text-yellow-300 text-3xl font-bold mb-4 drop-shadow-md mt-10">{getMessage()}</h2>
        
        <div className="flex justify-center items-center mb-6 mt-4">
          {[1, 2, 3].map((star) => (
            <div 
              key={star} 
              className={`transform ${stars >= star ? 'animate-starPop' : 'opacity-40'}`}
              style={{ animationDelay: `${(star - 1) * 0.3}s` }}
            >
              <img 
                src={stars >= star ? '/assets/ui/star-filled.png' : '/assets/ui/star-empty.png'} 
                alt={stars >= star ? 'Earned star' : 'Unearned star'} 
                className="w-16 h-16 mx-1"
              />
            </div>
          ))}
        </div>
        
        <div className="text-white text-xl mb-6">
          <p>Level {currentLevel} Complete</p>
          <p>Score: {score}</p>
        </div>
        
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={onReplay}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transform hover:scale-105 transition-all"
            style={{
              border: "2px solid #FFCC80",
              boxShadow: "0 4px 0 #E65100"
            }}
          >
            Replay
          </button>
          
          <button
            onClick={onNextLevel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transform hover:scale-105 transition-all"
            style={{
              border: "2px solid #A5D6A7",
              boxShadow: "0 4px 0 #2E7D32"
            }}
          >
            Next Level
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;