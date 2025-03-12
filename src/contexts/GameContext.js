import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  calculateGasEstimate, 
  createTransactionPayload, 
  formatTransactionReceipt, 
  handleTransactionError, 
  waitForTransaction 
} from './transactionUtils';

// Add the missing functions that were causing errors
// ====== BEGIN gameUtils additions ======
// Game level configuration
export const getLevelConfig = (level) => {
  const configs = {
    1: {
      rows: 8,
      cols: 8,
      fruitTypes: 5,
      targetScore: 1000,
      maxMoves: 20,
      obstacles: []
    },
    2: {
      rows: 8,
      cols: 8,
      fruitTypes: 6,
      targetScore: 1500,
      maxMoves: 18,
      obstacles: [
        { row: 3, col: 3 },
        { row: 3, col: 4 },
        { row: 4, col: 3 },
        { row: 4, col: 4 }
      ]
    },
    3: {
      rows: 9,
      cols: 9,
      fruitTypes: 6,
      targetScore: 2000,
      maxMoves: 16,
      obstacles: []
    },
    // Add more levels as needed
  };
  
  // Return requested level or default to level 1
  return configs[level] || configs[1];
};

// Initialize game board
export const initializeGameBoard = (rows, cols, fruitTypes, obstacles = []) => {
  const board = [];
  
  // Create empty board
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      // Check if this position has an obstacle
      const isObstacle = obstacles?.some(obs => obs.row === i && obs.col === j) || false;
      
      if (isObstacle) {
        row.push({ type: 0, isObstacle: true });
      } else {
        // Random fruit type (1 to fruitTypes)
        row.push({ type: Math.floor(Math.random() * fruitTypes) + 1, isObstacle: false });
      }
    }
    board.push(row);
  }
  
  return board;
};

// ====== END gameUtils additions ======

// ====== BEGIN transactionUtils additions ======
// Send a transaction to the Monad blockchain
export const sendMonadTransaction = async (contract, methodName, args = [], value = 0) => {
  if (!contract) {
    throw new Error('Contract not initialized');
  }
  
  try {
    // Estimate gas before sending transaction
    const gasEstimate = await calculateGasEstimate(contract, methodName, args, value);
    
    // Create transaction payload
    const txPayload = createTransactionPayload(gasEstimate, value);
    
    // Execute the transaction
    const transaction = await contract[methodName](...args, txPayload);
    
    // Wait for the transaction to be confirmed
    const receipt = await waitForTransaction(transaction);
    
    // Format and return the receipt
    return formatTransactionReceipt(receipt);
  } catch (error) {
    // Handle transaction errors
    handleTransactionError(error);
    throw error;
  }
};
// ====== END transactionUtils additions ======

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  // Player stats
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerPoints, setPlayerPoints] = useState(0);
  const [highScores, setHighScores] = useState([]); // Added missing highScores state
  
  // Game state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameBoard, setGameBoard] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [stars, setStars] = useState(0);
  const [isLevelPassed, setIsLevelPassed] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [gameError, setGameError] = useState(null);
  
  // Effects
  const [matchPosition, setMatchPosition] = useState(null);
  const [splashEffect, setSplashEffect] = useState(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTile, setDragStartTile] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState(0);
  
  // Game contract state
  const [gameContract] = useState(null);
  const [account] = useState(null);
  const [isConnected] = useState(false);
  
  // Load high scores on initialization
  useEffect(() => {
    // Example of loading high scores from localStorage
    const savedHighScores = localStorage.getItem('highScores');
    if (savedHighScores) {
      setHighScores(JSON.parse(savedHighScores));
    } else {
      // Default empty array if no scores exist
      setHighScores([]);
    }
  }, []);
  
  // Get level configuration
  const levelConfig = getLevelConfig(currentLevel);
  
  // Initialize level function defined with useCallback
  const initializeLevel = useCallback(() => {
    const config = getLevelConfig(currentLevel);
    setIsLoading(true);
    
    try {
      const newBoard = initializeGameBoard(config.rows, config.cols, config.fruitTypes, config.obstacles);
      setGameBoard(newBoard);
      setScore(0);
      setMoves(config.maxMoves);
      setStars(0);
      setIsLevelPassed(false);
      setIsGameActive(true);
      setSelectedTiles([]);
      setMatchPosition(null);
      setSplashEffect(null);
      setComboCount(0);
      setLastMatchTime(0);
      setGameError(null);
    } catch (error) {
      setGameError({ type: 'initialization', message: 'Failed to initialize level' });
    } finally {
      setIsLoading(false);
    }
  }, [currentLevel]);
  
  // Initialize level
  useEffect(() => {
    initializeLevel();
  }, [initializeLevel]);
  
  // Define processMatch function before it's used
  const processMatch = useCallback((matchedTiles) => {
    if (!isGameActive || matchedTiles.length < 3) return;
    
    // Calculate score based on match length
    const matchScore = matchedTiles.length * 10 * (1 + (comboCount * 0.1));
    
    // Update score
    setScore(prev => prev + matchScore);
    
    // Calculate combo
    const now = Date.now();
    const timeSinceLastMatch = now - lastMatchTime;
    if (timeSinceLastMatch < 2000) {
      setComboCount(prev => prev + 1);
    } else {
      setComboCount(1);
    }
    setLastMatchTime(now);
    
    // Set match position for animation
    const avgRow = matchedTiles.reduce((sum, tile) => sum + tile.row, 0) / matchedTiles.length;
    const avgCol = matchedTiles.reduce((sum, tile) => sum + tile.col, 0) / matchedTiles.length;
    setMatchPosition({ row: avgRow, col: avgCol });
    
    // Show splash effect
    setSplashEffect({
      position: { row: avgRow, col: avgCol },
      score: matchScore,
      combo: comboCount > 1 ? comboCount : null
    });
    
    // Update the game board (clear matched tiles and handle gravity)
    const newBoard = [...gameBoard];
    
    // Make sure game board is valid
    if (!newBoard.length || !newBoard[0].length) return;
    
    // Mark matched tiles for removal
    matchedTiles.forEach(tile => {
      if (newBoard[tile.row] && newBoard[tile.row][tile.col]) {
        newBoard[tile.row][tile.col] = null;
      }
    });
    
    // Apply gravity (move tiles down to fill empty spaces)
    for (let col = 0; col < newBoard[0].length; col++) {
      let emptyRow = -1;
      for (let row = newBoard.length - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          if (emptyRow === -1) emptyRow = row;
        } else if (emptyRow !== -1) {
          // Move tile down to the empty spot
          newBoard[emptyRow][col] = newBoard[row][col];
          newBoard[row][col] = null;
          emptyRow--;
        }
      }
    }
    
    // Fill in new tiles from the top
    for (let col = 0; col < newBoard[0].length; col++) {
      for (let row = 0; row < newBoard.length; row++) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = {
            type: Math.floor(Math.random() * levelConfig.fruitTypes) + 1,
            isObstacle: false
          };
        }
      }
    }
    
    // Update the board
    setGameBoard(newBoard);
    
    // Decrease moves
    setMoves(prev => prev - 1);
    
    // Clear selected tiles
    setSelectedTiles([]);
    
    // Check win condition
    if (score + matchScore >= levelConfig.targetScore) {
      setIsLevelPassed(true);
      setIsGameActive(false);
      
      // Calculate stars based on score and moves
      const starsEarned = Math.min(3, Math.ceil((score + matchScore) / levelConfig.targetScore * 3));
      setStars(starsEarned);
      
      // Update player level if this is a new level
      if (currentLevel === playerLevel) {
        setPlayerLevel(prev => prev + 1);
      }
      
      // Update high scores
      setHighScores(prev => {
        const newEntry = { 
          level: currentLevel, 
          score: score + matchScore, 
          stars: starsEarned,
          date: new Date().toISOString() 
        };
        
        // Add new score and sort by score (descending)
        const updatedScores = [...prev, newEntry]
          .sort((a, b) => b.score - a.score);
        
        // Limit to top 100 scores
        const limitedScores = updatedScores.slice(0, 100);
        
        // Save to localStorage
        localStorage.setItem('highScores', JSON.stringify(limitedScores));
        
        return limitedScores;
      });
    }
    
    // Check lose condition
    if (moves - 1 <= 0 && !isLevelPassed) {
      setIsGameActive(false);
    }
  }, [isGameActive, comboCount, lastMatchTime, gameBoard, levelConfig, score, currentLevel, playerLevel, isLevelPassed, moves]);
  
  const handleTileSelection = useCallback((rowIndex, colIndex) => {
    if (!isGameActive || moves <= 0) return;
    
    const currentTile = gameBoard[rowIndex][colIndex];
    if (!currentTile || currentTile.isObstacle) return;
    
    // Check if tile is already selected
    const isTileSelected = selectedTiles.some(
      tile => tile.row === rowIndex && tile.col === colIndex
    );
    
    // If already selected and it's the last tile in the selection, remove it
    if (isTileSelected && 
        selectedTiles.length > 0 && 
        selectedTiles[selectedTiles.length - 1].row === rowIndex && 
        selectedTiles[selectedTiles.length - 1].col === colIndex) {
      setSelectedTiles(prev => prev.slice(0, -1));
      return;
    }
    
    // If already selected but not the last one, do nothing
    if (isTileSelected) return;
    
    // Check if this tile is adjacent to the last selected tile
    if (selectedTiles.length > 0) {
      const lastTile = selectedTiles[selectedTiles.length - 1];
      const isAdjacent = (
        (Math.abs(lastTile.row - rowIndex) === 1 && lastTile.col === colIndex) ||
        (Math.abs(lastTile.col - colIndex) === 1 && lastTile.row === rowIndex)
      );
      
      if (!isAdjacent) return;
      
      // Check if the tiles are of the same type
      const lastTileType = gameBoard[lastTile.row][lastTile.col].type;
      if (currentTile.type !== lastTileType) return;
    }
    
    // Add the tile to selected tiles
    setSelectedTiles(prev => [...prev, { row: rowIndex, col: colIndex }]);
    
    // If we have at least 3 tiles selected, check for a match
    if (selectedTiles.length >= 2) {
      const allSameType = selectedTiles.every(tile => 
        gameBoard[tile.row][tile.col].type === currentTile.type
      );
      
      if (allSameType) {
        // Process match after a short delay to show the selection
        setTimeout(() => {
          processMatch([...selectedTiles, { row: rowIndex, col: colIndex }]);
        }, 300);
      }
    }
  }, [isGameActive, moves, gameBoard, selectedTiles, processMatch]);
  
  const restartLevel = useCallback(() => {
    const config = getLevelConfig(currentLevel);
    const newBoard = initializeGameBoard(config.rows, config.cols, config.fruitTypes, config.obstacles);
    setGameBoard(newBoard);
    setScore(0);
    setMoves(config.maxMoves);
    setStars(0);
    setIsLevelPassed(false);
    setIsGameActive(true);
    setSelectedTiles([]);
    setMatchPosition(null);
    setSplashEffect(null);
    setComboCount(0);
    setLastMatchTime(0);
    setGameError(null);
  }, [currentLevel]);
  
  const moveToNextLevel = useCallback(() => {
    if (isLevelPassed) {
      setCurrentLevel(prevLevel => prevLevel + 1);
    }
  }, [isLevelPassed]);
  
  const selectLevel = useCallback((level) => {
    // Only allow selecting levels the player has unlocked
    if (level <= playerLevel) {
      setCurrentLevel(level);
    }
  }, [playerLevel]);
  
  const handleDragStart = useCallback((rowIndex, colIndex) => {
    if (!isGameActive) return;
    
    setIsDragging(true);
    setDragStartTile({ row: rowIndex, col: colIndex });
    
    // Select the tile in the game context
    if (selectedTiles.length === 0 || 
        (selectedTiles.length > 0 && 
         (selectedTiles[selectedTiles.length - 1].row !== rowIndex || 
          selectedTiles[selectedTiles.length - 1].col !== colIndex))) {
      handleTileSelection(rowIndex, colIndex);
    }
  }, [isGameActive, selectedTiles, handleTileSelection]);

  const handleDragOver = useCallback((rowIndex, colIndex) => {
    if (!isDragging || !isGameActive || !dragStartTile) return;
    
    // If we've moved to a new tile during dragging
    if (dragStartTile.row !== rowIndex || dragStartTile.col !== colIndex) {
      // Check if this is a valid next tile (adjacent to the last selected tile)
      if (selectedTiles.length > 0) {
        const lastTile = selectedTiles[selectedTiles.length - 1];
        const isAdjacent = (
          (Math.abs(lastTile.row - rowIndex) === 1 && lastTile.col === colIndex) ||
          (Math.abs(lastTile.col - colIndex) === 1 && lastTile.row === rowIndex)
        );
        
        if (isAdjacent) {
          handleTileSelection(rowIndex, colIndex);
          setDragStartTile({ row: rowIndex, col: colIndex });
        }
      }
    }
  }, [isDragging, isGameActive, dragStartTile, selectedTiles, handleTileSelection]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStartTile(null);
  }, []);

  const shuffleBoard = useCallback(() => {
    if (!isGameActive) return;
    
    const config = getLevelConfig(currentLevel);
    const newBoard = initializeGameBoard(config.rows, config.cols, config.fruitTypes, config.obstacles);
    setGameBoard(newBoard);
    setSelectedTiles([]);
    setMatchPosition(null);
    setSplashEffect(null);
    
    // Penalize player for shuffling (optional)
    const shufflePenalty = Math.min(2, moves - 1); // Ensure at least 1 move remains
    setMoves(prev => prev - shufflePenalty);
  }, [isGameActive, currentLevel, moves]);
  
  const getHint = useCallback(() => {
    if (!isGameActive || !gameBoard.length) return null;
    
    // Find a potential match
    for (let row = 0; row < gameBoard.length; row++) {
      for (let col = 0; col < gameBoard[0].length; col++) {
        // Check if current tile is part of a potential match
        const currentTile = gameBoard[row][col];
        if (!currentTile || currentTile.isObstacle) continue;
        
        // Check right
        if (col + 2 < gameBoard[0].length) {
          const rightTile = gameBoard[row][col + 1];
          const rightTile2 = gameBoard[row][col + 2];
          if (rightTile && rightTile2 && 
              currentTile.type === rightTile.type && 
              currentTile.type === rightTile2.type) {
            return [
              { row, col },
              { row, col: col + 1 },
              { row, col: col + 2 }
            ];
          }
        }
        
        // Check down
        if (row + 2 < gameBoard.length) {
          const downTile = gameBoard[row + 1][col];
          const downTile2 = gameBoard[row + 2][col];
          if (downTile && downTile2 && 
              currentTile.type === downTile.type && 
              currentTile.type === downTile2.type) {
            return [
              { row, col },
              { row: row + 1, col },
              { row: row + 2, col }
            ];
          }
        }
      }
    }
    
    return null;
  }, [isGameActive, gameBoard]);

  // Function to handle in-game purchases or power-ups
  const purchasePowerUp = useCallback(async (powerUpType) => {
    if (!isConnected || !gameContract || !account) {
      setGameError({ type: 'purchase', message: 'Wallet not connected' });
      return;
    }
    
    setTransactionPending(true);
    try {
      const tx = await sendMonadTransaction(
        gameContract,
        'purchasePowerUp',
        [powerUpType]
      );
      
      await tx.wait();
      
      // Apply power-up effect based on type
      switch (powerUpType) {
        case 'extraMoves':
          setMoves(prev => prev + 5);
          break;
        case 'scoreBooster':
          setScore(prev => Math.floor(prev * 1.1)); // 10% score boost
          break;
        case 'clearRow':
          // Logic to clear a row would go here
          break;
        default:
          break;
      }
      
      // Update player points
      const updatedStats = await gameContract.getPlayerStats(account);
      setPlayerPoints(updatedStats.points.toNumber());
      
    } catch (err) {
      console.error('Error purchasing power-up:', err);
      setGameError({ type: 'purchase', message: 'Failed to purchase power-up' });
    } finally {
      setTransactionPending(false);
    }
  }, [isConnected, gameContract, account]);
  
  // Clear error function
  const clearError = useCallback(() => setGameError(null), []);
  
  return (
    <GameContext.Provider
      value={{
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
        
        // Drag state
        isDragging,
        dragStartTile,
        comboCount,
        lastMatchTime,
        
        // Functions
        handleTileSelection,
        restartLevel,
        moveToNextLevel,
        selectLevel,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        shuffleBoard,
        getHint,
        purchasePowerUp,
        
        // Clear error
        clearError
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);

export default GameContext;