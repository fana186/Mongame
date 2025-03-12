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
  
  // Create a new game board
  export const initializeGameBoard = (rows, cols, fruitTypes, obstacles = []) => {
    const board = [];
    
    // Create empty board
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        // Check if this position has an obstacle
        const isObstacle = obstacles.some(obs => obs.row === i && obs.col === j);
        
        if (isObstacle) {
          row.push({ type: 0, isObstacle: true });
        } else {
          // Random fruit type (1 to fruitTypes)
          row.push({ type: Math.floor(Math.random() * fruitTypes) + 1, isObstacle: false });
        }
      }
      board.push(row);
    }
    
    // Make sure no matches exist initially
    const newBoard = ensureNoInitialMatches(board, fruitTypes);
    
    return newBoard;
  };
  
  // Ensure no matches exist in the initial board
  const ensureNoInitialMatches = (board, fruitTypes) => {
    const rows = board.length;
    const cols = board[0].length;
    const newBoard = JSON.parse(JSON.stringify(board));
    
    // Check for and resolve horizontal matches
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 2; col++) {
        if (newBoard[row][col].isObstacle) continue;
        
        // Check if three in a row
        if (
          newBoard[row][col].type === newBoard[row][col + 1].type &&
          newBoard[row][col].type === newBoard[row][col + 2].type
        ) {
          // Change the third fruit to a different type
          let newType;
          do {
            newType = Math.floor(Math.random() * fruitTypes) + 1;
          } while (newType === newBoard[row][col].type);
          
          newBoard[row][col + 2].type = newType;
        }
      }
    }
    
    // Check for and resolve vertical matches
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows - 2; row++) {
        if (newBoard[row][col].isObstacle) continue;
        
        // Check if three in a column
        if (
          newBoard[row][col].type === newBoard[row + 1][col].type &&
          newBoard[row][col].type === newBoard[row + 2][col].type
        ) {
          // Change the third fruit to a different type
          let newType;
          do {
            newType = Math.floor(Math.random() * fruitTypes) + 1;
          } while (newType === newBoard[row][col].type);
          
          newBoard[row + 2][col].type = newType;
        }
      }
    }
    
    return newBoard;
  };
  
  // Apply gravity to the board after matches are removed
  export const applyGravity = (board) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    const cols = newBoard[0].length;
    
    for (let col = 0; col < cols; col++) {
      let emptyRow = -1;
      for (let row = newBoard.length - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          if (emptyRow === -1) emptyRow = row;
        } else if (emptyRow !== -1 && !newBoard[row][col].isObstacle) {
          // Move tile down to the empty spot
          newBoard[emptyRow][col] = newBoard[row][col];
          newBoard[row][col] = null;
          emptyRow--;
        }
      }
    }
    
    return newBoard;
  };
  
  // Fill empty spaces in board with new fruit tiles
  export const fillEmptySpaces = (board, fruitTypes) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    
    for (let row = 0; row < newBoard.length; row++) {
      for (let col = 0; col < newBoard[0].length; col++) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = {
            type: Math.floor(Math.random() * fruitTypes) + 1,
            isObstacle: false
          };
        }
      }
    }
    
    return newBoard;
  };
  
  // Check for matches in the board
  export const checkForMatches = (board) => {
    const matches = [];
    const rows = board.length;
    const cols = board[0].length;
    
    // Check horizontal matches
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 2; col++) {
        if (!board[row][col] || board[row][col].isObstacle) continue;
        
        if (
          board[row][col] &&
          board[row][col + 1] &&
          board[row][col + 2] &&
          board[row][col].type === board[row][col + 1].type &&
          board[row][col].type === board[row][col + 2].type
        ) {
          const matchTiles = [
            { row, col },
            { row, col: col + 1 },
            { row, col: col + 2 }
          ];
          
          // Check if more tiles match to the right
          let nextCol = col + 3;
          while (
            nextCol < cols &&
            board[row][nextCol] &&
            board[row][nextCol].type === board[row][col].type
          ) {
            matchTiles.push({ row, col: nextCol });
            nextCol++;
          }
          
          matches.push(matchTiles);
          col = nextCol - 1; // Skip ahead to avoid duplicate matches
        }
      }
    }
    
    // Check vertical matches
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows - 2; row++) {
        if (!board[row][col] || board[row][col].isObstacle) continue;
        
        if (
          board[row][col] &&
          board[row + 1][col] &&
          board[row + 2][col] &&
          board[row][col].type === board[row + 1][col].type &&
          board[row][col].type === board[row + 2][col].type
        ) {
          const matchTiles = [
            { row, col },
            { row: row + 1, col },
            { row: row + 2, col }
          ];
          
          // Check if more tiles match below
          let nextRow = row + 3;
          while (
            nextRow < rows &&
            board[nextRow][col] &&
            board[nextRow][col].type === board[row][col].type
          ) {
            matchTiles.push({ row: nextRow, col });
            nextRow++;
          }
          
          matches.push(matchTiles);
          row = nextRow - 1; // Skip ahead to avoid duplicate matches
        }
      }
    }
    
    return matches;
  };
  
  // Check if there are possible moves available
  export const hasPossibleMoves = (board) => {
    if (!board.length) return false;
    
    const rows = board.length;
    const cols = board[0].length;
    
    // Check horizontal swaps
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 1; col++) {
        if (
          board[row][col] && 
          board[row][col + 1] && 
          !board[row][col].isObstacle && 
          !board[row][col + 1].isObstacle
        ) {
          // Try swapping
          const tempBoard = JSON.parse(JSON.stringify(board));
          const temp = tempBoard[row][col];
          tempBoard[row][col] = tempBoard[row][col + 1];
          tempBoard[row][col + 1] = temp;
          
          // Check if swap creates a match
          if (checkForMatches(tempBoard).length > 0) {
            return true;
          }
        }
      }
    }
    
    // Check vertical swaps
    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols; col++) {
        if (
          board[row][col] && 
          board[row + 1][col] && 
          !board[row][col].isObstacle && 
          !board[row + 1][col].isObstacle
        ) {
          // Try swapping
          const tempBoard = JSON.parse(JSON.stringify(board));
          const temp = tempBoard[row][col];
          tempBoard[row][col] = tempBoard[row + 1][col];
          tempBoard[row + 1][col] = temp;
          
          // Check if swap creates a match
          if (checkForMatches(tempBoard).length > 0) {
            return true;
          }
        }
      }
    }
    
    return false;
  };
  
  // Check if a swap is valid (creates a match)
  export const isValidSwap = (board, row1, col1, row2, col2) => {
    if (!board || !board.length) return false;
    
    // Must be adjacent
    const isAdjacent = (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
    
    if (!isAdjacent) return false;
    
    // Try the swap
    const tempBoard = JSON.parse(JSON.stringify(board));
    const temp = tempBoard[row1][col1];
    tempBoard[row1][col1] = tempBoard[row2][col2];
    tempBoard[row2][col2] = temp;
    
    // Check if the swap creates a match
    return checkForMatches(tempBoard).length > 0;
  };
  
  // Calculate score for a match
  export const calculateScore = (matchedTiles, comboCount = 1) => {
    // Base score: 10 points per tile
    const baseScore = matchedTiles.length * 10;
    
    // Bonus for longer matches
    let lengthBonus = 0;
    if (matchedTiles.length > 3) {
      lengthBonus = (matchedTiles.length - 3) * 5;
    }
    
    // Combo multiplier (10% increase per combo)
    const comboMultiplier = 1 + (comboCount * 0.1);
    
    return Math.floor((baseScore + lengthBonus) * comboMultiplier);
  };
  
  // Create initial board with random tiles
  export const createInitialBoard = (rows, cols, fruitTypes) => {
    return initializeGameBoard(rows, cols, fruitTypes);
  };