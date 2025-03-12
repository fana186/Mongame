import { useState, useEffect, useCallback } from 'react';
import { initializeGameBoard, processMove, checkMatches, applyGravity, refillBoard } from '../utils/gameLogic';

const useGameBoard = (levelConfig) => {
  const [gameBoard, setGameBoard] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [matchPositions, setMatchPositions] = useState([]);
  
  // Initialize the game board
  useEffect(() => {
    if (levelConfig) {
      const { rows, cols, fruitTypes, maxMoves } = levelConfig;
      const initialBoard = initializeGameBoard(rows, cols, fruitTypes);
      
      // Make sure there are no matches on the initial board
      let finalBoard = [...initialBoard];
      let hasMatches = true;
      
      while (hasMatches) {
        const matches = checkMatches(finalBoard);
        if (matches.length === 0) {
          hasMatches = false;
        } else {
          // Swap random tiles to break matches
          for (const match of matches) {
            for (const tile of match) {
              // Find a random position to swap with
              const randomRow = Math.floor(Math.random() * rows);
              const randomCol = Math.floor(Math.random() * cols);
              
              // Skip if it's the same position
              if (randomRow === tile.row && randomCol === tile.col) continue;
              
              // Swap tiles
              const temp = finalBoard[tile.row][tile.col];
              finalBoard[tile.row][tile.col] = finalBoard[randomRow][randomCol];
              finalBoard[randomRow][randomCol] = temp;
            }
          }
        }
      }
      
      setGameBoard(finalBoard);
      setMoves(maxMoves);
      setScore(0);
      setSelectedTiles([]);
      setIsGameActive(true);
      setMatchPositions([]);
    }
  }, [levelConfig]);
  
  const handleTileSelection = useCallback((rowIndex, colIndex) => {
    if (!isGameActive) return;
    
    const result = processMove(gameBoard, selectedTiles, rowIndex, colIndex);
    const { updatedBoard, updatedSelectedTiles, matchedTiles, matchedFruitType, points } = result;
    
    setGameBoard(updatedBoard);
    setSelectedTiles(updatedSelectedTiles);
    
    if (matchedTiles.length > 0) {
      // Update score
      setScore(prevScore => prevScore + points);
      
      // Create match position effect data
      const matchEffects = matchedTiles.map(tile => ({
        row: tile.row,
        col: tile.col,
        fruitType: matchedFruitType
      }));
      setMatchPositions(matchEffects);
      
      // Clear matched tiles and apply gravity after delay
      setTimeout(() => {
        const boardAfterGravity = applyGravity(updatedBoard);
        const refillledBoard = refillBoard(boardAfterGravity, levelConfig.fruitTypes);
        setGameBoard(refillledBoard);
        setMatchPositions([]);
        
        // Check for cascading matches
        checkCascadingMatches(refillledBoard);
      }, 500);
      
      // Decrement moves
      setMoves(prevMoves => prevMoves - 1);
    }
  }, [gameBoard, selectedTiles, isGameActive, levelConfig]);
  
  const checkCascadingMatches = useCallback((board) => {
    const cascadeMatches = checkMatches(board);
    if (cascadeMatches.length > 0) {
      // Get match positions for effect
      const matchEffects = [];
      let points = 0;
      
      cascadeMatches.forEach(match => {
        // Add bonus points for cascade matches
        const matchPoints = match.length * 10 * 1.5; // 50% bonus
        points += matchPoints;
        
        // Add match positions for effects
        match.forEach(tile => {
          matchEffects.push({
            row: tile.row,
            col: tile.col,
            fruitType: board[tile.row][tile.col].type
          });
          
          // Clear the matched tiles
          board[tile.row][tile.col] = null;
        });
      });
      
      setMatchPositions(matchEffects);
      setScore(prevScore => prevScore + points);
      
      // Apply gravity and refill again
      setTimeout(() => {
        const boardAfterGravity = applyGravity(board);
        const refillledBoard = refillBoard(boardAfterGravity, levelConfig.fruitTypes);
        setGameBoard(refillledBoard);
        setMatchPositions([]);
        
        // Keep checking for more cascades
        checkCascadingMatches(refillledBoard);
      }, 500);
    }
  }, [levelConfig]);
  
  const getHint = useCallback(() => {
    if (!isGameActive) return null;
    
    // Check for potential matches
    for (let row = 0; row < gameBoard.length; row++) {
      for (let col = 0; col < gameBoard[row].length; col++) {
        // Skip empty tiles
        if (!gameBoard[row][col]) continue;
        
        // Check each direction for potential matches
        const directions = [
          { dr: -1, dc: 0 }, // up
          { dr: 1, dc: 0 },  // down
          { dr: 0, dc: -1 }, // left
          { dr: 0, dc: 1 }   // right
        ];
        
        for (const dir of directions) {
          const newRow = row + dir.dr;
          const newCol = col + dir.dc;
          
          // Check if the new position is valid
          if (
            newRow >= 0 && 
            newRow < gameBoard.length && 
            newCol >= 0 && 
            newCol < gameBoard[row].length &&
            gameBoard[newRow][newCol]
          ) {
            // Simulate a swap
            const tempBoard = JSON.parse(JSON.stringify(gameBoard));
            const temp = tempBoard[row][col];
            tempBoard[row][col] = tempBoard[newRow][newCol];
            tempBoard[newRow][newCol] = temp;
            
            // Check if the swap creates a match
            const matches = checkMatches(tempBoard);
            if (matches.length > 0) {
              return {
                tile1: { row, col },
                tile2: { row: newRow, col: newCol }
              };
            }
          }
        }
      }
    }
    
    return null;
  }, [gameBoard, isGameActive]);
  
  const shuffleBoard = useCallback(() => {
    if (!isGameActive) return;
    
    // Create a flattened copy of the board
    const flattened = gameBoard.flat().filter(Boolean);
    
    // Shuffle the flattened array
    for (let i = flattened.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flattened[i], flattened[j]] = [flattened[j], flattened[i]];
    }
    
    // Rebuild the 2D board with shuffled tiles
    const rows = gameBoard.length;
    const cols = gameBoard[0].length;
    const shuffledBoard = Array(rows).fill().map(() => Array(cols).fill(null));
    
    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gameBoard[r][c] !== null) {
          shuffledBoard[r][c] = flattened[index++];
        }
      }
    }
    
    // Check for matches in the shuffled board and shuffle again if needed
    const matches = checkMatches(shuffledBoard);
    if (matches.length > 0) {
      // Try again if there are matches
      return shuffleBoard();
    }
    
    setGameBoard(shuffledBoard);
    setSelectedTiles([]);
  }, [gameBoard, isGameActive]);
  
  return {
    gameBoard,
    selectedTiles,
    score,
    moves,
    isGameActive,
    matchPositions,
    handleTileSelection,
    getHint,
    shuffleBoard,
    resetGame: () => {
      if (levelConfig) {
        const { rows, cols, fruitTypes, maxMoves } = levelConfig;
        const initialBoard = initializeGameBoard(rows, cols, fruitTypes);
        setGameBoard(initialBoard);
        setMoves(maxMoves);
        setScore(0);
        setSelectedTiles([]);
        setIsGameActive(true);
        setMatchPositions([]);
      }
    }
  };
};

export default useGameBoard;