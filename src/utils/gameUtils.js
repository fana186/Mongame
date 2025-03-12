/**
 * Game utility functions for the Fruit Match game
 */

// Initialize a game board with random fruits
export function initializeBoard(rows, cols, fruitTypes) {
    const board = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const randomFruit = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        row.push({
          id: `${i}-${j}`,
          type: randomFruit,
          matched: false,
        });
      }
      board.push(row);
    }
    return board;
  }
  
  // Check for matches in the game board
  export function checkMatches(board) {
    const rows = board.length;
    const cols = board[0].length;
    const matches = [];
    
    // Check horizontal matches
    for (let i = 0; i < rows; i++) {
      let count = 1;
      for (let j = 1; j < cols; j++) {
        if (board[i][j].type === board[i][j-1].type) {
          count++;
          if (count >= 3 && j === cols - 1) {
            for (let k = j - count + 1; k <= j; k++) {
              matches.push({ row: i, col: k });
            }
          }
        } else {
          if (count >= 3) {
            for (let k = j - count; k < j; k++) {
              matches.push({ row: i, col: k });
            }
          }
          count = 1;
        }
      }
    }
    
    // Check vertical matches
    for (let j = 0; j < cols; j++) {
      let count = 1;
      for (let i = 1; i < rows; i++) {
        if (board[i][j].type === board[i-1][j].type) {
          count++;
          if (count >= 3 && i === rows - 1) {
            for (let k = i - count + 1; k <= i; k++) {
              matches.push({ row: k, col: j });
            }
          }
        } else {
          if (count >= 3) {
            for (let k = i - count; k < i; k++) {
              matches.push({ row: k, col: j });
            }
          }
          count = 1;
        }
      }
    }
    
    return [...new Set(matches.map(m => `${m.row}-${m.col}`))].map(id => {
      const [row, col] = id.split('-').map(Number);
      return { row, col };
    });
  }
  
  // Swap two pieces on the board
  export function swapPieces(board, pos1, pos2) {
    const newBoard = JSON.parse(JSON.stringify(board));
    const temp = newBoard[pos1.row][pos1.col];
    newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col];
    newBoard[pos2.row][pos2.col] = temp;
    return newBoard;
  }
  
  // Check if a swap is valid
  export function isValidSwap(pos1, pos2) {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }
  
  // Calculate score from matches
  export function calculateScore(matches, multiplier = 1) {
    return matches.length * 100 * multiplier;
  }
  
  // Check if level is completed
  export function isLevelCompleted(score, targetScore) {
    return score >= targetScore;
  }
  
  // Get star rating based on score
  export function getStarRating(score, oneStarScore, twoStarScore, threeStarScore) {
    if (score >= threeStarScore) return 3;
    if (score >= twoStarScore) return 2;
    if (score >= oneStarScore) return 1;
    return 0;
  }