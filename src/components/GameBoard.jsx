import React, { useRef } from 'react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import MatchParticles from './animations/MatchParticles';
import JuiceSplash from './animations/JuiceSplash';

const GameBoard = ({ 
  gameBoard, 
  onTileSelect, 
  selectedTiles, 
  currentLevel, 
  score, 
  moves, 
  stars,
  fruits,
  matchPosition,
  splashEffect,
  setMatchPosition,
  setSplashEffect,
  dragStartTile,
  setDragStartTile,
  isDragging,
  setIsDragging
}) => {
  const boardRef = useRef(null);
  const { playSound } = useSoundEffects();
  useHapticFeedback();

  // Define handlers for drag functionality
  const handleDragStart = (rowIndex, colIndex) => {
    setIsDragging(true);
    setDragStartTile({ row: rowIndex, col: colIndex });
    onTileSelect(rowIndex, colIndex);
    playSound('select');
  };

  const handleDragOver = (rowIndex, colIndex) => {
    if (isDragging && dragStartTile) {
      // Check if this is a valid adjacent tile
      const rowDiff = Math.abs(rowIndex - dragStartTile.row);
      const colDiff = Math.abs(colIndex - dragStartTile.col);
      
      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        onTileSelect(rowIndex, colIndex);
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartTile(null);
  };

  // Handle touch moves for mobile
  const handleTouchMove = (e) => {
    if (isDragging && boardRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      const board = boardRef.current.getBoundingClientRect();
      const x = touch.clientX - board.left;
      const y = touch.clientY - board.top;
      
      // Calculate which tile the touch is over
      const tileSize = 48 + 8; // Tile size + gap
      const colIndex = Math.floor(x / tileSize);
      const rowIndex = Math.floor(y / tileSize);
      
      // Check if valid indices and different from drag start
      if (rowIndex >= 0 && rowIndex < gameBoard.length && 
          colIndex >= 0 && colIndex < gameBoard[0].length &&
          (rowIndex !== dragStartTile.row || colIndex !== dragStartTile.col)) {
        handleDragOver(rowIndex, colIndex);
      }
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-xl relative" ref={boardRef}
      style={{
        background: "linear-gradient(to bottom, rgba(121,85,72,0.9), rgba(78,52,46,0.9))",
        border: "4px solid #5D4037",
        borderRadius: "16px",
        boxShadow: "0 6px 0 #4E342E, 0 8px 12px rgba(0,0,0,0.4)"
      }}>
      
      {/* Game board header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center">
          <span className="text-white text-lg font-bold">Level {currentLevel}</span>
          <div className="ml-4 flex">
            {[1, 2, 3].map((star) => (
              <img 
                key={star} 
                src={star <= stars ? '/assets/ui/star-filled.png' : '/assets/ui/star-empty.png'} 
                alt={star <= stars ? 'Filled star' : 'Empty star'} 
                className="w-6 h-6 mx-0.5"
              />
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-white text-lg mr-4">Score: {score}</span>
          <span className="text-white text-lg">Moves: {moves}</span>
        </div>
      </div>

      {/* Game board grid */}
      <div
        className="grid gap-2 transform perspective-800 rotateX-5 mb-4"
        style={{
          gridTemplateColumns: `repeat(${gameBoard[0]?.length || 5}, 1fr)`,
          perspective: '800px',
          touchAction: 'none',
          backgroundImage: "url('/assets/ui/board-bg.png')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          padding: "8px",
          borderRadius: "12px"
        }}
        onTouchMove={handleTouchMove}
      >
        {gameBoard.map((row, rowIndex) => (
          row.map((fruit, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onMouseDown={() => handleDragStart(rowIndex, colIndex)}
              onMouseEnter={() => handleDragOver(rowIndex, colIndex)}
              onMouseUp={handleDragEnd}
              onTouchStart={() => handleDragStart(rowIndex, colIndex)}
              onTouchEnd={handleDragEnd}
              data-tile={`${rowIndex}-${colIndex}`}
              className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-lg transform transition-all duration-300 
                ${dragStartTile && dragStartTile.row === rowIndex && dragStartTile.col === colIndex ? 'scale-110 rotate-6' : 'hover:scale-105'}
                ${selectedTiles.some(tile => tile.row === rowIndex && tile.col === colIndex) ? 'ring-4 ring-yellow-400' : ''}
              `}
              style={{
                background: "url('/assets/ui/tile-bg.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                transform: `translateZ(${dragStartTile && dragStartTile.row === rowIndex && dragStartTile.col === colIndex ? '10px' : '0px'})`,
                cursor: isDragging ? 'grabbing' : 'grab',
                boxShadow: dragStartTile && dragStartTile.row === rowIndex && dragStartTile.col === colIndex ? "0 10px 20px rgba(0,0,0,0.4)" : "0 4px 6px rgba(0,0,0,0.2)",
                border: dragStartTile && dragStartTile.row === rowIndex && dragStartTile.col === colIndex ? "2px solid #FFD700" : "2px solid #D7CCC8"
              }}
            >
              {fruit && (
                <div
                  style={{
                    width: "80%",
                    height: "80%",
                    backgroundImage: `url(${fruit.image})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center"
                  }}
                />
              )}
            </div>
          ))
        ))}
      </div>

      {/* Game instructions */}
      <div className="text-white text-center text-sm opacity-80 mb-2">
        Drag to connect matching fruits
      </div>

      {/* Visual effects */}
      {matchPosition && (
        <MatchParticles
          x={matchPosition.x}
          y={matchPosition.y}
          color={matchPosition.color}
        />
      )}

      {splashEffect && (
        <JuiceSplash
          x={splashEffect.x}
          y={splashEffect.y}
          color={splashEffect.color}
          onComplete={() => setSplashEffect(null)}
        />
      )}
    </div>
  );
};

export default GameBoard;