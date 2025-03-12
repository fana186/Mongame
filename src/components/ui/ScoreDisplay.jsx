import React, { useEffect, useRef } from 'react';

/**
 * ScoreDisplay component for showing the current score and remaining moves
 * 
 * @param {Object} props
 * @param {number} props.score - Current game score
 * @param {number} props.moves - Remaining moves
 * @param {number} props.targetScore - Score needed to clear the level (optional)
 * @param {boolean} props.animate - Whether to animate score changes
 */
const ScoreDisplay = ({ 
  score = 0, 
  moves = 0, 
  targetScore, 
  animate = true 
}) => {
  const prevScoreRef = useRef(score);
  const scoreRef = useRef(null);
  
  useEffect(() => {
    // Animate score changes
    if (animate && scoreRef.current && score > prevScoreRef.current) {
      scoreRef.current.classList.add('animate-pulse', 'text-yellow-500', 'font-bold', 'scale-110');
      
      const timer = setTimeout(() => {
        if (scoreRef.current) {
          scoreRef.current.classList.remove('animate-pulse', 'text-yellow-500', 'font-bold', 'scale-110');
        }
      }, 700);
      
      return () => clearTimeout(timer);
    }
    
    prevScoreRef.current = score;
  }, [score, animate]);

  // Determine if moves are getting low (warning state)
  const isLowMoves = moves <= 3;
  
  // Calculate progress percentage if target score is provided
  const progressPercentage = targetScore ? Math.min(100, (score / targetScore) * 100) : 0;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg" style={{
      backgroundImage: "url('/assets/ui/wooden-panel.png')",
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
    }}>
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold text-yellow-100 shadow-sm">Score:</div>
        <div 
          ref={scoreRef}
          className="text-2xl font-bold text-white transition-all duration-300 transform"
        >
          {score}
        </div>
      </div>
      
      {targetScore && (
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mt-1 mb-2">
          <div 
            className="h-full bg-yellow-500 transition-all duration-500"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundImage: 'linear-gradient(to right, #f59e0b, #fbbf24)'
            }}
          />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold text-yellow-100 shadow-sm">Moves:</div>
        <div className={`text-2xl font-bold transition-all duration-300 ${
          isLowMoves ? 'text-red-500 animate-pulse' : 'text-white'
        }`}>
          {moves}
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;