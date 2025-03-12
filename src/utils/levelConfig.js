/**
 * Level configurations for the Fruit Match game
 */

// Fruit types available in the game
export const FRUIT_TYPES = [
    'watermelon',
    'tomato', 
    'eggplant',
    'orange',
    'banana'
  ];
  
  // Special fruit types (unlock at higher levels)
  export const SPECIAL_FRUIT_TYPES = [
    'apple',
    'cherry',
    'strawberry',
    'pineapple'
  ];
  
  // Level definitions with increasing difficulty
  export const LEVEL_CONFIGS = [
    // Level 1: Tutorial level
    {
      id: 1,
      rows: 6,
      cols: 6,
      moveLimit: 15,
      targetScore: 500,
      fruitTypes: FRUIT_TYPES.slice(0, 3), // Only 3 fruit types for tutorial
      specialItems: [],
      tutorial: true,
      description: "Match 3 or more fruits to score points!"
    },
    
    // Level 2: Introduce one more fruit
    {
      id: 2,
      rows: 6,
      cols: 6,
      moveLimit: 15,
      targetScore: 600,
      fruitTypes: FRUIT_TYPES.slice(0, 4),
      specialItems: [],
      tutorial: false,
      description: "More fruit varieties appear!"
    },
    
    // Level 3: Introduce all basic fruits
    {
      id: 3,
      rows: 7,
      cols: 6,
      moveLimit: 18,
      targetScore: 800,
      fruitTypes: FRUIT_TYPES,
      specialItems: [],
      tutorial: false,
      description: "Larger board with all fruits!"
    },
    
    // Level 4: Introduce obstacles
    {
      id: 4,
      rows: 7,
      cols: 6,
      moveLimit: 20,
      targetScore: 1000,
      fruitTypes: FRUIT_TYPES,
      specialItems: [],
      obstacles: [
        { row: 2, col: 2, type: 'rock' },
        { row: 2, col: 3, type: 'rock' },
        { row: 4, col: 2, type: 'rock' },
        { row: 4, col: 3, type: 'rock' }
      ],
      tutorial: false,
      description: "Watch out for obstacles!"
    },
    
    // Level 5: Larger board
    {
      id: 5,
      rows: 8,
      cols: 7,
      moveLimit: 22,
      targetScore: 1200,
      fruitTypes: FRUIT_TYPES,
      specialItems: [],
      tutorial: false,
      description: "Bigger board, more matches!"
    },
    
    // Level 6: Introduce special fruits
    {
      id: 6,
      rows: 8,
      cols: 7,
      moveLimit: 25,
      targetScore: 1500,
      fruitTypes: [...FRUIT_TYPES, SPECIAL_FRUIT_TYPES[0]],
      specialItems: [
        { type: 'rainbow', chance: 0.05 }
      ],
      tutorial: false,
      description: "Special fruits appear!"
    },
    
    // Level 7: More complex layout
    {
      id: 7,
      rows: 8,
      cols: 8,
      moveLimit: 25,
      targetScore: 1800,
      fruitTypes: [...FRUIT_TYPES, ...SPECIAL_FRUIT_TYPES.slice(0, 2)],
      specialItems: [
        { type: 'rainbow', chance: 0.05 },
        { type: 'bomb', chance: 0.05 }
      ],
      obstacles: [
        { row: 3, col: 3, type: 'rock' },
        { row: 3, col: 4, type: 'rock' },
        { row: 4, col: 3, type: 'rock' },
        { row: 4, col: 4, type: 'rock' }
      ],
      tutorial: false,
      description: "Complex layout with special items!"
    },
    
    // Level 8: Time pressure
    {
      id: 8,
      rows: 8,
      cols: 8,
      moveLimit: 30,
      targetScore: 2000,
      timeLimit: 120, // 2 minutes
      fruitTypes: [...FRUIT_TYPES, ...SPECIAL_FRUIT_TYPES.slice(0, 2)],
      specialItems: [
        { type: 'rainbow', chance: 0.05 },
        { type: 'bomb', chance: 0.05 },
        { type: 'clock', chance: 0.05 } // Adds time
      ],
      tutorial: false,
      description: "Beat the clock!"
    },
    
    // Level 9: Special objectives
    {
      id: 9,
      rows: 9,
      cols: 8,
      moveLimit: 30,
      targetScore: 2200,
      fruitTypes: [...FRUIT_TYPES, ...SPECIAL_FRUIT_TYPES.slice(0, 3)],
      specialItems: [
        { type: 'rainbow', chance: 0.05 },
        { type: 'bomb', chance: 0.05 }
      ],
      objectives: [
        { type: 'watermelon', count: 15 },
        { type: 'tomato', count: 12 }
      ],
      tutorial: false,
      description: "Collect specific fruits!"
    },
    
    // Level 10: Boss level
    {
      id: 10,
      rows: 9,
      cols: 9,
      moveLimit: 35,
      targetScore: 2500,
      fruitTypes: [...FRUIT_TYPES, ...SPECIAL_FRUIT_TYPES],
      specialItems: [
        { type: 'rainbow', chance: 0.07 },
        { type: 'bomb', chance: 0.07 },
        { type: 'lightning', chance: 0.05 }
      ],
      obstacles: [
        { row: 0, col: 0, type: 'ice' },
        { row: 0, col: 8, type: 'ice' },
        { row: 8, col: 0, type: 'ice' },
        { row: 8, col: 8, type: 'ice' },
        { row: 4, col: 4, type: 'boss', health: 5 }
      ],
      tutorial: false,
      description: "Defeat the boss fruit!"
    }
  ];
  
  // Get level configuration by ID
  export const getLevelConfig = (levelId) => {
    return LEVEL_CONFIGS.find(config => config.id === levelId) || LEVEL_CONFIGS[0];
  };
  
  // Generate initial game board for a level
  export const generateInitialBoard = (levelConfig) => {
    const { rows, cols, fruitTypes, obstacles = [] } = levelConfig;
    const board = Array(rows).fill().map(() => Array(cols).fill(null));
    
    // Place obstacles first
    obstacles.forEach(obstacle => {
      board[obstacle.row][obstacle.col] = { 
        type: obstacle.type, 
        isObstacle: true,
        health: obstacle.health || 1
      };
    });
    
    // Fill the rest with random fruits
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip if there's already an obstacle
        if (board[row][col]) continue;
        
        // Randomly select a fruit type
        const randomIndex = Math.floor(Math.random() * fruitTypes.length);
        board[row][col] = { type: fruitTypes[randomIndex] };
      }
    }
    
    // Ensure the board has at least one valid match to start
    return ensureBoardHasMatches(board, fruitTypes);
  };
  
  // Make sure the board has at least one valid match
  const ensureBoardHasMatches = (board, fruitTypes) => {
    const gameBoard = JSON.parse(JSON.stringify(board));
    
    // Import findPossibleMatches from gameLogic
    // NOTE: This creates a circular dependency, may need restructuring in a real app
    const { findPossibleMatches } = require('./gameLogic');
    
    const possibleMatches = findPossibleMatches(gameBoard);
    
    // If there are matches, return the board as is
    if (possibleMatches.length > 0) {
      return gameBoard;
    }
    
    // If no matches, shuffle the board
    return shuffleBoard(gameBoard, fruitTypes);
  };
  
  // Shuffle the board
  const shuffleBoard = (board, fruitTypes) => {
    const rows = board.length;
    const cols = board[0].length;
    const newBoard = JSON.parse(JSON.stringify(board));
    
    // Only shuffle the fruit tiles (not obstacles)
    const fruitTiles = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (newBoard[row][col] && !newBoard[row][col].isObstacle) {
          fruitTiles.push({ row, col, fruit: newBoard[row][col] });
        }
      }
    }
    
    // Shuffle the fruits
    for (let i = fruitTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = fruitTiles[i].fruit;
      fruitTiles[i].fruit = fruitTiles[j].fruit;
      fruitTiles[j].fruit = temp;
    }
    
    // Place shuffled fruits back
    fruitTiles.forEach(tile => {
      newBoard[tile.row][tile.col] = tile.fruit;
    });
    
    // Recursively check for matches again
    const { findPossibleMatches } = require('./gameLogic');
    const possibleMatches = findPossibleMatches(newBoard);
    
    if (possibleMatches.length > 0) {
      return newBoard;
    }
    
    // If still no matches, create a guaranteed match
    createGuaranteedMatch(newBoard, fruitTypes);
    
    return newBoard;
  };
  
  // Create a guaranteed match on the board
  const createGuaranteedMatch = (board, fruitTypes) => {
    const rows = board.length;
    const cols = board[0].length;
    
    // Find a location for a horizontal match
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 2; col++) {
        // Check if these three positions have no obstacles
        if (board[row][col] && !board[row][col].isObstacle && 
            board[row][col+1] && !board[row][col+1].isObstacle &&
            board[row][col+2] && !board[row][col+2].isObstacle) {
          
          // Choose a random fruit type
          const randomType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
          
          // Set all three to the same type
          board[row][col].type = randomType;
          board[row][col+1].type = randomType;
          board[row][col+2].type = randomType;
          
          return;
        }
      }
    }
    
    // If no horizontal match could be created, try vertical
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows - 2; row++) {
        // Check if these three positions have no obstacles
        if (board[row][col] && !board[row][col].isObstacle && 
            board[row+1][col] && !board[row+1][col].isObstacle &&
            board[row+2][col] && !board[row+2][col].isObstacle) {
          
          // Choose a random fruit type
          const randomType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
          
          // Set all three to the same type
          board[row][col].type = randomType;
          board[row+1][col].type = randomType;
          board[row+2][col].type = randomType;
          
          return;
        }
      }
    }
  };