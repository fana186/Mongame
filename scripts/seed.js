const { ethers } = require("hardhat");
require("dotenv").config();

// Contract addresses from deployment
const FRUIT_GAME_ADDRESS = "0xee66c31aeD56C3A6E7197C3D50D413Fd586B9ba2";
const MON_TOKEN_ADDRESS = "0x27a2807f41248ba8FBa9C70Cf6c415F3c9906Dcf";

// Initial level configurations to seed
const INITIAL_LEVELS = [
  {
    levelId: 1,
    targetScore: 500,
    moveLimit: 15,
    boardSize: [8, 8],
    fruitTypes: 5,
    specialItemProbability: 5, // 5% chance
    objectives: [] // No special objectives for level 1
  },
  {
    levelId: 2,
    targetScore: 800,
    moveLimit: 20,
    boardSize: [8, 8],
    fruitTypes: 6,
    specialItemProbability: 8,
    objectives: [
      { fruitType: 1, count: 10 } // Collect 10 watermelons
    ]
  },
  {
    levelId: 3,
    targetScore: 1200,
    moveLimit: 22,
    boardSize: [8, 9],
    fruitTypes: 6,
    specialItemProbability: 10,
    objectives: [
      { fruitType: 2, count: 12 }, // Collect 12 tomatoes
      { fruitType: 3, count: 8 }   // Collect 8 eggplants
    ]
  }
];

async function main() {
  console.log("Seeding initial data to Monad Testnet...");

  // Get the deployer account
  const [admin] = await ethers.getSigners();
  console.log(`Seeding with admin account: ${admin.address}`);

  // Connect to deployed contracts
  console.log("Connecting to deployed contracts...");
  const FruitGame = await ethers.getContractFactory("FruitGame");
  const fruitGame = FruitGame.attach(FRUIT_GAME_ADDRESS);
  
  const MONToken = await ethers.getContractFactory("MONToken");
  const monToken = MONToken.attach(MON_TOKEN_ADDRESS);

  console.log("Contracts connected. Starting seed process...");

  // Add initial levels
  console.log("Adding initial level configurations...");
  for (const level of INITIAL_LEVELS) {
    console.log(`Adding level ${level.levelId}...`);
    
    // Convert objectives to contract format
    const objectivesData = level.objectives.map(obj => ({
      fruitType: obj.fruitType,
      count: obj.count
    }));
    
    // Add level to contract
    const tx = await fruitGame.addLevel(
      level.levelId,
      level.targetScore,
      level.moveLimit,
      level.boardSize[0],
      level.boardSize[1],
      level.fruitTypes,
      level.specialItemProbability,
      objectivesData
    );
    
    await tx.wait();
    console.log(`Level ${level.levelId} added!`);
  }

  // Add some test users and unlock first level for them
  console.log("Setting up test accounts...");
  const testAccounts = [
    "0x123456789012345678901234567890123456789a", // Replace with actual test accounts if needed
    "0x123456789012345678901234567890123456789b",
    "0x123456789012345678901234567890123456789c"
  ];
  
  for (const account of testAccounts) {
    console.log(`Setting up account ${account}...`);
    
    // Unlock first level for test accounts
    const unlockTx = await fruitGame.unlockLevelForPlayer(account, 1);
    await unlockTx.wait();
    
    // Mint some initial tokens for test accounts
    const mintTx = await monToken.mint(account, ethers.utils.parseEther("100"));
    await mintTx.wait();
    
    console.log(`Account ${account} setup complete!`);
  }

  console.log("Seeding complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });