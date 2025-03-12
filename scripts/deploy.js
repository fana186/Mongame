const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying contracts to Monad Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Deploy MONToken first
  console.log("Deploying MONToken...");
  const MONToken = await ethers.getContractFactory("MONToken");
  const monToken = await MONToken.deploy("Fruit Game Token", "FGT");
  await monToken.deployed();
  console.log(`MONToken deployed to: ${monToken.address}`);

  // Deploy FruitGame with MONToken address
  console.log("Deploying FruitGame...");
  const FruitGame = await ethers.getContractFactory("FruitGame");
  const fruitGame = await FruitGame.deploy(monToken.address);
  await fruitGame.deployed();
  console.log(`FruitGame deployed to: ${fruitGame.address}`);

  // Grant minter role to the FruitGame contract
  console.log("Setting up contract permissions...");
  const MINTER_ROLE = await monToken.MINTER_ROLE();
  await monToken.grantRole(MINTER_ROLE, fruitGame.address);
  console.log(`Granted MINTER_ROLE to FruitGame contract`);

  console.log("Deployment complete!");
  
  // Return the deployed contract addresses for verification
  return { 
    monTokenAddress: monToken.address, 
    fruitGameAddress: fruitGame.address 
  };
}

main()
  .then((addresses) => {
    console.log(`
Deployment Summary:
------------------
MONToken: ${addresses.monTokenAddress}
FruitGame: ${addresses.fruitGameAddress}
    `);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });