import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import FallingLeaves from './animations/FallingLeaves';
import MatchParticles from './animations/MatchParticles';
import JuiceSplash from './animations/JuiceSplash';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import LevelSelector from './LevelSelector';
import GameControls from './GameControls';
import VictoryScreen from './VictoryScreen';
import WalletConnect from './WalletConnect';
import StarRating from './ui/StarRating';
import ScoreDisplay from './ui/ScoreDisplay';
import WoodenButton from './ui/WoodenButton';
import { useGame } from '../contexts/GameContext';
import { useWallet } from '../contexts/WalletContext';
import { LEVEL_CONFIGS } from '../utils/levelConfig';

const FruitMatchGame = () => {
  const {
    // Player stats
    playerLevel,
    playerPoints,
    highScores,
    
    // Game state
    currentLevel,
    levelConfig,
    gameBoard,
    selectedTiles,
    score,
    moves,
    stars,
    isLevelPassed,
    isGameActive,
    isLoading,
    transactionPending,
    gameError,
    
    // Effects
    matchPosition,
    splashEffect,
    setSplashEffect,
    
    restartLevel,
    moveToNextLevel,
    selectLevel,
    handleDragStart: contextHandleDragStart,
    handleDragOver: contextHandleDragOver,
    handleDragEnd: contextHandleDragEnd,
    shuffleBoard,
    getHint,
    purchasePowerUp,
    clearError
  } = useGame();

  const {
    isConnected,
    account,
    error: walletError,
    connectWallet  } = useWallet();

  // Board reference for drag interactions
  const boardRef = useRef(null);
  
  // Local drag state (to be synced with context)
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragStartTile] = useState(null);

  // Hook integrations with proper initialization
  const { playSound, playBackgroundMusic } = useSoundEffects(true);  // Enable sound by default
  const { 
    vibrateMatch, 
    vibrateInvalidMove, 
    vibrateLevelComplete, 
    vibrateStarEarned,
    vibrateHint,
    vibrateShuffle,
    vibrateButtonClick,
    vibrateSelect
  } = useHapticFeedback(true);  // Enable haptic feedback by default

  // Styled fruits (using image references)
  const fruits = [
    { type: 1, name: 'watermelon', image: '/assets/fruits/watermelon.png', color: 'bg-green-100' },
    { type: 2, name: 'tomato', image: '/assets/fruits/tomato.png', color: 'bg-red-100' },
    { type: 3, name: 'eggplant', image: '/assets/fruits/eggplant.png', color: 'bg-purple-100' },
    { type: 4, name: 'orange', image: '/assets/fruits/orange.png', color: 'bg-orange-100' },
    { type: 5, name: 'banana', image: '/assets/fruits/banana.png', color: 'bg-yellow-100' },
    { type: 6, name: 'apple', image: '/assets/fruits/apple.png', color: 'bg-red-200' },
    { type: 7, name: 'cherry', image: '/assets/fruits/cherry.png', color: 'bg-red-500' },
    { type: 8, name: 'strawberry', image: '/assets/fruits/strawberry.png', color: 'bg-red-300' },
    { type: 9, name: 'pineapple', image: '/assets/fruits/pineapple.png', color: 'bg-yellow-300' }
  ];

  // Get fruit info by type number
  const getFruitInfo = (fruitType) => {
    const fruit = fruits.find(f => f.type === fruitType);
    return fruit || fruits[0]; // Default to first fruit if not found
  };

  // Initialize background music on component mount
  useEffect(() => {
    playBackgroundMusic('/assets/sounds/background-music.mp3', 0.4);
    
    // Clean up will be handled by the hook
    return () => {
      // Audio cleanup handled by the hook
    };
  }, [playBackgroundMusic]);

  // Play sound effects when game state changes
  useEffect(() => {
    if (matchPosition) {
      playSound('match');
      vibrateMatch();
    }
    
    if (isLevelPassed) {
      playSound('levelComplete');
      vibrateLevelComplete();
    }
  }, [matchPosition, isLevelPassed, playSound, vibrateMatch, vibrateLevelComplete]);

  // Effects for stars earned
  useEffect(() => {
    if (stars > 0) {
      playSound('star');
      vibrateStarEarned();
    }
  }, [stars, playSound, vibrateStarEarned]);

  // Handle drag events to sync with GameContext
  const handleLocalDragStart = (rowIndex, colIndex) => {
    if (!isGameActive || isLoading) return;
    
    setIsDragging(true);
    setDragStartTile({ row: rowIndex, col: colIndex });
    contextHandleDragStart(rowIndex, colIndex);
    
    playSound('select');
    vibrateSelect();
  };

  const handleLocalDragOver = (rowIndex, colIndex) => {
    if (!isDragging || !isGameActive) return;
    
    contextHandleDragOver(rowIndex, colIndex);
    
    // Additional feedback when valid move
    if (gameBoard[rowIndex] && gameBoard[rowIndex][colIndex]) {
      vibrateSelect();
    }
  };

  const handleLocalDragEnd = () => {
    setIsDragging(false);
    setDragStartTile(null);
    contextHandleDragEnd();
  };

  const handleBoardTouch = (e) => {
    if (!isDragging || !boardRef.current) return;
    
    // Prevent default to avoid scrolling while dragging
    e.preventDefault();
    
    const touch = e.touches[0];
    const board = boardRef.current.getBoundingClientRect();
    const x = touch.clientX - board.left;
    const y = touch.clientY - board.top;
    
    // Calculate which tile this corresponds to
    if (gameBoard && gameBoard.length > 0) {
      const tileSize = board.width / gameBoard[0].length;
      const col = Math.floor(x / tileSize);
      const row = Math.floor(y / tileSize);
      
      // Ensure within bounds
      if (row >= 0 && row < gameBoard.length && col >= 0 && col < gameBoard[0].length) {
        handleLocalDragOver(row, col);
      }
    }
  };

  // Function to get a hint
  const handleLocalHint = () => {
    if (!isGameActive) return;
    
    const hint = getHint();
    if (hint) {
      playSound('hint');
      vibrateHint();
    }
  };

  // Function to shuffle the board
  const handleLocalShuffle = () => {
    if (!isGameActive) return;
    
    shuffleBoard();
    playSound('shuffle');
    vibrateShuffle();
  };
  
  // Function to handle power-up purchase with Monad tokens
  const handlePowerUpPurchase = async (powerUpType) => {
    if (!isConnected) {
      playSound('invalid');
      return;
    }
    
    try {
      await purchasePowerUp(powerUpType);
      playSound('purchase');
      vibrateButtonClick();
    } catch (error) {
      playSound('invalid');
      vibrateInvalidMove();
    }
  };

  // Calculate level progress
  const progressPercent = levelConfig && levelConfig.targetScore 
    ? Math.min(100, Math.round((score / levelConfig.targetScore) * 100)) 
    : 0;

  // Calculate moves percentage
  const movesPercent = levelConfig && levelConfig.maxMoves
    ? Math.round((moves / levelConfig.maxMoves) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 rounded-lg relative"
      style={{
        backgroundImage: "url('/assets/backgrounds/forest-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>

      <FallingLeaves /> {/* Background animation */}

      {/* Header section with wallet */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg mr-4">Monad Fruit Match</h1>
          <StarRating rating={stars} maxRating={3} size="sm" />
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white bg-opacity-70 px-3 py-1 rounded-full">
              <span className="text-sm font-medium truncate max-w-xs">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
            <div className="bg-amber-600 bg-opacity-80 px-3 py-1 rounded-full text-white">
              <span className="text-sm font-medium">{playerPoints || 0} MON</span>
            </div>
          </div>
        ) : (
          <WoodenButton
            label="Connect Monad Wallet"
            variant="primary"
            onClick={() => {
              connectWallet();
              vibrateButtonClick();
            }}
            size="sm"
          />
        )}
      </div>

      {/* Transaction pending notification */}
      {transactionPending && (
        <div className="fixed top-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          Transaction pending on Monad...
        </div>
      )}

      {/* Game section */}
      {isConnected ? (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Level selection panel */}
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-lg" style={{
              background: "linear-gradient(to bottom, rgba(121,85,72,0.85), rgba(78,52,46,0.85))",
              border: "4px solid #5D4037",
              borderRadius: "12px",
              boxShadow: "0 4px 0 #4E342E, 0 6px 12px rgba(0,0,0,0.3)"
            }}>
              <h3 className="text-xl font-bold text-yellow-100 mb-3 text-center drop-shadow-sm">Level {currentLevel}</h3>
              <ScoreDisplay 
                score={score} 
                moves={moves} 
                targetScore={levelConfig?.targetScore || 500}
                moveLimit={levelConfig?.maxMoves || 15}
                progressPercent={progressPercent}
                movesPercent={movesPercent}
                animate={true} 
              />
              
              {/* Level description */}
              {levelConfig && levelConfig.description && (
                <div className="mt-2 text-center text-yellow-100 text-sm">
                  {levelConfig.description}
                </div>
              )}
              
              {/* Network info */}
              <div className="mt-4 p-2 bg-black bg-opacity-30 rounded text-yellow-100 text-xs">
                <div className="font-semibold">Monad Testnet</div>
                <div>Chain ID: 10143</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <WoodenButton
                label="Restart Level"
                variant="secondary"
                onClick={() => {
                  restartLevel();
                  vibrateButtonClick();
                  playSound('buttonClick');
                }}
                size="md"
              />
              <WoodenButton
                label="Next Level"
                variant="success"
                onClick={() => {
                  if (isLevelPassed) {
                    moveToNextLevel();
                    vibrateButtonClick();
                    playSound('buttonClick');
                  }
                }}
                disabled={!isLevelPassed}
                size="md"
              />
            </div>
            
            {/* Power-ups section - Monad token integration */}
            <div className="p-4 bg-amber-900 bg-opacity-70 rounded-lg">
              <h3 className="text-lg font-bold text-yellow-100 mb-2">Power-ups</h3>
              <div className="flex flex-col gap-2">
                <WoodenButton
                  label="Extra Moves (5 MON)"
                  variant="primary"
                  onClick={() => handlePowerUpPurchase('extraMoves')}
                  disabled={transactionPending || !isGameActive}
                  size="sm"
                />
                <WoodenButton
                  label="Score Booster (10 MON)"
                  variant="primary"
                  onClick={() => handlePowerUpPurchase('scoreBooster')}
                  disabled={transactionPending || !isGameActive}
                  size="sm"
                />
                <WoodenButton
                  label="Clear Row (15 MON)"
                  variant="primary"
                  onClick={() => handlePowerUpPurchase('clearRow')}
                  disabled={transactionPending || !isGameActive}
                  size="sm"
                />
              </div>
              <p className="text-xs text-yellow-100 mt-2">
                Uses Monad tokens from your connected wallet
              </p>
            </div>
            
            {/* Level selector component */}
            <LevelSelector 
              currentLevel={currentLevel}
              availableLevels={playerLevel}
              highScores={highScores}
              levelConfigs={LEVEL_CONFIGS}
              onSelectLevel={(level) => {
                selectLevel(level);
                vibrateButtonClick();
                playSound('buttonClick');
              }}
            />
          </div>

          {/* Game board */}
          <div className="p-4 rounded-lg shadow-xl relative" ref={boardRef}
            style={{
              background: "linear-gradient(to bottom, rgba(121,85,72,0.9), rgba(78,52,46,0.9))",
              border: "4px solid #5D4037",
              borderRadius: "16px",
              boxShadow: "0 6px 0 #4E342E, 0 8px 12px rgba(0,0,0,0.4)"
            }}>
            {/* Game board header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-yellow-100">Match the Fruits</h2>
              <div className="flex gap-2">
                <button 
                  className="w-10 h-10 flex items-center justify-center bg-amber-700 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
                  onClick={() => {
                    // Screenshot functionality would go here
                    vibrateButtonClick();
                    playSound('buttonClick');
                  }}
                >
                  <Camera size={20} className="text-yellow-100" />
                </button>
              </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-yellow-100 animate-pulse">Loading game board...</div>
              </div>
            ) : gameBoard && gameBoard.length > 0 ? (
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
                onTouchMove={handleBoardTouch}
                onTouchEnd={handleLocalDragEnd}
              >
                {gameBoard.map((row, rowIndex) => (
                  row.map((tile, colIndex) => {
                    if (!tile) return (
                      <div 
                        key={`empty-${rowIndex}-${colIndex}`}
                        className="w-12 h-12 rounded-lg"
                      />
                    );
                    
                    // Find if this tile is selected
                    const isSelected = selectedTiles.some(
                      t => t.row === rowIndex && t.col === colIndex
                    );
                    
                    // Determine if tile is an obstacle
                    const isObstacle = tile && tile.isObstacle;
                    
                    // Get fruit info based on the type number from context
                    const fruitInfo = getFruitInfo(tile.type);

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        onMouseDown={() => !isObstacle && handleLocalDragStart(rowIndex, colIndex)}
                        onMouseEnter={() => handleLocalDragOver(rowIndex, colIndex)}
                        onMouseUp={handleLocalDragEnd}
                        onTouchStart={() => !isObstacle && handleLocalDragStart(rowIndex, colIndex)}
                        data-tile={`${rowIndex}-${colIndex}`}
                        className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-lg transform transition-all duration-200 ${
                          isSelected ? 'scale-110 rotate-6 z-10' : 'hover:scale-105'
                        } ${isObstacle ? 'bg-gray-500' : ''}`}
                        style={{
                          background: isObstacle ? 
                            "url('/assets/ui/obstacle-bg.png')" : 
                            "url('/assets/ui/tile-bg.png')",
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          transform: `translateZ(${isSelected ? '10px' : '0px'})`,
                          cursor: isObstacle ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
                          boxShadow: isSelected ? "0 10px 20px rgba(0,0,0,0.4)" : "0 4px 6px rgba(0,0,0,0.2)",
                          border: isSelected ? "2px solid #FFD700" : "2px solid #D7CCC8"
                        }}
                      >
                        {!isObstacle && (
                          <div
                            style={{
                              width: "80%",
                              height: "80%",
                              backgroundImage: `url(/assets/fruits/${fruitInfo.name}.png)`,
                              backgroundSize: "contain",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center"
                            }}
                          />
                        )}
                        
                        {/* Render obstacle */}
                        {isObstacle && (
                          <div
                            style={{
                              width: "80%",
                              height: "80%",
                              backgroundImage: "url(/assets/obstacles/rock.png)",
                              backgroundSize: "contain",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center"
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-yellow-100">No game board available</p>
              </div>
            )}

            {/* Game instructions */}
            <div className="text-center text-yellow-100 mt-2 mb-4">
              <p>Drag to connect matching fruits</p>
            </div>

            {/* Game controls */}
            <GameControls
              onHint={() => {
                handleLocalHint();
                vibrateButtonClick();
              }}
              onShuffle={() => {
                handleLocalShuffle();
                vibrateButtonClick();
              }}
              movesLeft={moves > 0}
              disabled={!isGameActive || transactionPending}
            />

            {/* Visual effects */}
            {matchPosition && (
              <MatchParticles
                x={matchPosition.row}
                y={matchPosition.col}
                color={getFruitInfo(gameBoard[matchPosition.row]?.[matchPosition.col]?.type)?.color || 'bg-yellow-100'}
              />
            )}

            {splashEffect && (
              <JuiceSplash
                x={splashEffect.position.row}
                y={splashEffect.position.col}
                score={splashEffect.score}
                combo={splashEffect.combo}
                onComplete={() => setSplashEffect(null)}
              />
            )}
          </div>
        </div>
      ) : (
        <WalletConnect
          onConnect={() => {
            connectWallet();
            vibrateButtonClick();
            playSound('buttonClick');
          }}
          error={walletError}
          network={{
            name: "Monad Testnet",
            chainId: 10143,
            currency: "MON",
            rpcUrl: "https://testnet-rpc.monad.xyz",
            explorer: "https://testnet.monadexplorer.com"
          }}
        />
      )}

      {/* Level victory screen */}
      {isLevelPassed && (
        <VictoryScreen
          level={currentLevel}
          score={score}
          stars={stars}
          highScore={highScores[currentLevel] || 0}
          onReplay={() => {
            restartLevel();
            vibrateButtonClick();
            playSound('buttonClick');
          }}
          onNextLevel={() => {
            moveToNextLevel();
            vibrateButtonClick();
            playSound('buttonClick');
          }}
        />
      )}

      {/* Error message */}
      {gameError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="font-bold">Error</div>
          <div>{gameError.message}</div>
          <button 
            className="mt-1 text-xs underline"
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default FruitMatchGame;