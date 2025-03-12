/**
 * Game mechanics for the Fruit Match game
 */

// Check if tiles can form a valid match (same fruit type)
export const isValidMatch = (tiles, gameBoard) => {
    if (!tiles || tiles.length < 3) return false;
    
    // Get the type of the first tile
    const firstTile = gameBoard[tiles[0].row][tiles[0].col];
    const firstType = firstTile ? firstTile.type : null;
    
    // Check if all tiles are of the same type
    return firstType && tiles.every(tile => {
      const currentTile = gameBoard[tile.row][tile.col];
      return currentTile && currentTile.type === firstType;
    });
  };
  
  // Calculate score based on match length
  export const calculateMatchScore = (matchLength) => {
    // Base score for minimum match (3)
    const baseScore = 100;
    
    // Bonus for longer matches
    const lengthBonus = Math.pow(2, matchLength - 3) * 50;
    
    return baseScore + lengthBonus;
  };
  
  // Calculate bonus points for special conditions (e.g., combos, speed)
  export const calculateBonusPoints = (matchLength, combosCount, timeElapsed) => {
    let bonus = 0;
    
    // Combo bonus (consecutive matches)
    if (combosCount > 1) {
      bonus += combosCount * 25;
    }
    
    // Speed bonus (faster matching gets more points)
    if (timeElapsed < 1.5) {
      bonus += 30;
    } else if (timeElapsed < 3) {
      bonus += 15;
    }
    
    return bonus;
  };
  
  // Check if two tiles are adjacent
  export const areAdjacent = (tile1, tile2) => {
    const rowDiff = Math.abs(tile1.row - tile2.row);
    const colDiff = Math.abs(tile1.col - tile2.col);
    
    // Tiles are adjacent if they differ by 1 in either row or column (but not both)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };
  
  // Check if a path exists between tiles (all adjacent)
  export const isValidPath = (tiles) => {
    if (!tiles || tiles.length < 2) return true;
    
    // Check each consecutive pair of tiles
    for (let i = 1; i < tiles.length; i++) {
      if (!areAdjacent(tiles[i-1], tiles[i])) {
        return false;
      }
    }
    
    return true;
  };
  
  // Fill empty spaces with new tiles
  export const fillEmptySpaces = (gameBoard, fruitTypes) => {
    const newBoard = JSON.parse(JSON.stringify(gameBoard));
    
    // Iterate through each column
    for (let col = 0; col < newBoard[0].length; col++) {
      // Check for empty spaces and fill from top to bottom
      for (let row = newBoard.length - 1; row >= 0; row--) {
        if (!newBoard[row][col]) {
          // Find a non-empty tile above to drop down
          let foundTile = false;
          
          for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
            if (newBoard[aboveRow][col]) {
              // Move tile down
              newBoard[row][col] = newBoard[aboveRow][col];
              newBoard[aboveRow][col] = null;
              foundTile = true;
              break;
            }
          }
          
          // If no tile found above, generate a new random tile
          if (!foundTile) {
            const randomIndex = Math.floor(Math.random() * fruitTypes.length);
            newBoard[row][col] = { 
              type: fruitTypes[randomIndex],
              isNew: true
            };
          }
        }
      }
    }
    
    return newBoard;
  };
  
  // Find all possible matches on the board
  export const findPossibleMatches = (gameBoard) => {
    const rows = gameBoard.length;
    const cols = gameBoard[0].length;
    const possibleMatches = [];
    
    // Helper to check if three tiles have the same type
    const checkThreeTiles = (tile1, tile2, tile3) => {
      if (!tile1 || !tile2 || !tile3) return false;
      return tile1.type === tile2.type && tile2.type === tile3.type;
    };
    
    // Check horizontally
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 2; col++) {
        if (checkThreeTiles(
          gameBoard[row][col],
          gameBoard[row][col + 1],
          gameBoard[row][col + 2]
        )) {
          possibleMatches.push([
            { row, col },
            { row, col: col + 1 },
            { row, col: col + 2 }
          ]);
        }
      }
    }
    
    // Check vertically
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows - 2; row++) {
        if (checkThreeTiles(
          gameBoard[row][col],
          gameBoard[row + 1][col],
          gameBoard[row + 2][col]
        )) {
          possibleMatches.push([
            { row, col },
            { row: row + 1, col },
            { row: row + 2, col }
          ]);
        }
      }
    }
    
    // Check L-shapes and other patterns
    // (These are more complex matches, could be added for additional hint functionality)
    
    return possibleMatches;
  };
  
  // Shuffle the board when no moves are available
  export const shuffleBoard = (gameBoard) => {
    const rows = gameBoard.length;
    const cols = gameBoard[0].length;
    const newBoard = JSON.parse(JSON.stringify(gameBoard));
    
    // Collect all tiles
    const allTiles = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (newBoard[row][col]) {
          allTiles.push(newBoard[row][col]);
        }
      }
    }
    
    // Shuffle the tiles
    for (let i = allTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
    }
    
    // Place tiles back on the board
    let tileIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (newBoard[row][col]) {
          newBoard[row][col] = allTiles[tileIndex++];
        }
      }
    }
    
    return newBoard;
  };
  
  // Calculate number of stars earned (1-3) based on score and moves
  export const calculateStars = (score, moves, levelConfig) => {
    const { targetScore, moveLimit } = levelConfig;
    
    // No stars if target score not reached
    if (score < targetScore) return 0;
    
    // Calculate percentage of max possible score
    const scorePercentage = score / targetScore;
    
    // Calculate move efficiency (lower is better)
    const moveEfficiency = moves / moveLimit;
    
    // 3 stars: High score (150%+ of target) and efficient moves (used less than 80% of moves)
    if (scorePercentage >= 1.5 && moveEfficiency <= 0.8) {
      return 3;
    }
    
    // 2 stars: Good score (120%+ of target) or efficient moves
    if (scorePercentage >= 1.2 || moveEfficiency <= 0.9) {
      return 2;
    }
    
    // 1 star: Reached target score
    return 1;
  };
  
  // Get a hint (finds a valid match)
  export const getHint = (gameBoard) => {
    const possibleMatches = findPossibleMatches(gameBoard);
    
    if (possibleMatches.length > 0) {
      // Return a random match from possible matches
      const randomIndex = Math.floor(Math.random() * possibleMatches.length);
      return possibleMatches[randomIndex];
    }
    
    return null;
  };