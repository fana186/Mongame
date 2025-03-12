import React from 'react';

const LevelSelector = ({ 
  currentLevel, 
  maxUnlockedLevel,
  onLevelSelect,
  playerStats
}) => {
  // Generate an array of available levels
  const levels = Array.from({ length: 20 }, (_, index) => index + 1);

  return (
    <div className="p-4 rounded-lg shadow-xl"
      style={{
        background: "linear-gradient(to bottom, rgba(121,85,72,0.7), rgba(78,52,46,0.9))",
        border: "4px solid #5D4037",
        borderRadius: "16px",
        boxShadow: "0 6px 0 #4E342E, 0 8px 12px rgba(0,0,0,0.4)",
        maxHeight: "500px",
        overflowY: "auto"
      }}>
      <h3 className="text-white text-xl font-bold mb-4 text-center">Levels</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {levels.map((level) => {
          // Determine if level is locked, available, or current
          const isLocked = level > maxUnlockedLevel;
          const isCurrent = level === currentLevel;
          
          // Get stars earned for this level from player stats (if available)
          const starsEarned = playerStats?.levelStats?.[level]?.stars || 0;
          
          return (
            <button
              key={level}
              onClick={() => !isLocked && onLevelSelect(level)}
              disabled={isLocked}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                ${isCurrent ? 'ring-4 ring-yellow-400' : ''}
              `}
              style={{
                backgroundImage: `url('/assets/ui/${isLocked ? 'level-locked.png' : isCurrent ? 'level-complete.png' : 'level-available.png'}')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "80px",
                height: "80px"
              }}
            >
              <span className="text-white font-bold text-xl drop-shadow-md">{level}</span>
              
              {/* Show stars if level is unlocked */}
              {!isLocked && (
                <div className="flex mt-1">
                  {[1, 2, 3].map((star) => (
                    <img 
                      key={star} 
                      src={star <= starsEarned ? '/assets/ui/star-filled.png' : '/assets/ui/star-empty.png'} 
                      alt={star <= starsEarned ? 'Filled star' : 'Empty star'} 
                      className="w-4 h-4"
                    />
                  ))}
                </div>
              )}
              
              {/* Show lock icon if level is locked */}
              {isLocked && (
                <div className="text-white text-2xl">🔒</div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-amber-800 bg-opacity-50 rounded-lg">
        <h4 className="text-white text-lg font-bold mb-2">Player Stats</h4>
        <div className="text-white">
          <p>Level: {playerStats.level || 1}</p>
          <p>Total Points: {playerStats.points || 0}</p>
          <p>Last Check-in: {
            playerStats.lastCheckIn 
              ? new Date(playerStats.lastCheckIn * 1000).toLocaleDateString() 
              : 'Never'
          }</p>
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;