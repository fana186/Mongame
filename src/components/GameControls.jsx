import React from 'react';
import { Repeat, RefreshCw, Camera, Volume2, VolumeX } from 'lucide-react';

const GameControls = ({ 
  onRestart, 
  onHint, 
  onScreenshot,
  isSoundEnabled,
  onToggleSound,
  hintsRemaining,
  currentLevel
}) => {
  return (
    <div className="flex justify-center gap-3 mt-4">
      <button
        onClick={onRestart}
        className="p-3 rounded-full bg-amber-700 hover:bg-amber-800 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
        style={{
          border: "2px solid #8D6E63",
          boxShadow: "0 4px 0 #5D4037, 0 6px 10px rgba(0,0,0,0.2)"
        }}
        title="Restart Level"
      >
        <RefreshCw size={24} />
      </button>

      <button
        onClick={onHint}
        disabled={hintsRemaining <= 0}
        className={`p-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
          hintsRemaining <= 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          border: "2px solid #80CBC4",
          boxShadow: "0 4px 0 #00796B, 0 6px 10px rgba(0,0,0,0.2)"
        }}
        title={`Hint (${hintsRemaining} remaining)`}
      >
        <div className="relative">
          <Repeat size={24} />
          <span className="absolute -top-1 -right-1 bg-white text-teal-700 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
            {hintsRemaining}
          </span>
        </div>
      </button>

      <button
        onClick={onScreenshot}
        className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
        style={{
          border: "2px solid #B39DDB",
          boxShadow: "0 4px 0 #673AB7, 0 6px 10px rgba(0,0,0,0.2)"
        }}
        title="Take Screenshot"
      >
        <Camera size={24} />
      </button>

      <button
        onClick={onToggleSound}
        className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
        style={{
          border: "2px solid #90CAF9",
          boxShadow: "0 4px 0 #1976D2, 0 6px 10px rgba(0,0,0,0.2)"
        }}
        title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
      >
        {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </div>
  );
};

export default GameControls;