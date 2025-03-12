/**
 * Transaction utility functions for blockchain interactions
 */

import { ethers } from 'ethers';
import FruitGameABI from '../contracts/abis/FruitGame.json';
import MONTokenABI from '../contracts/abis/MONToken.json';
import { getGameAddress, getTokenAddress } from '../contracts/addresses';

// Get contract instances
export async function getContracts(provider) {
  const signer = await provider.getSigner();
  const gameAddress = getGameAddress();
  const tokenAddress = getTokenAddress();
  
  const gameContract = new ethers.Contract(
    gameAddress,
    FruitGameABI,
    signer
  );
  
  const tokenContract = new ethers.Contract(
    tokenAddress,
    MONTokenABI,
    signer
  );
  
  return { gameContract, tokenContract };
}

// Submit score to blockchain
export async function submitScore(gameContract, levelId, score, moves) {
  try {
    const tx = await gameContract.submitScore(levelId, score, moves);
    return await tx.wait();
  } catch (error) {
    console.error("Error submitting score:", error);
    throw error;
  }
}

// Claim level rewards
export async function claimReward(gameContract, levelId) {
  try {
    const tx = await gameContract.claimReward(levelId);
    return await tx.wait();
  } catch (error) {
    console.error("Error claiming reward:", error);
    throw error;
  }
}

// Get user's token balance
export async function getTokenBalance(tokenContract, address) {
  try {
    const balance = await tokenContract.balanceOf(address);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error("Error getting token balance:", error);
    return "0";
  }
}

// Format transaction error messages for user display
export function formatTransactionError(error) {
  if (error.reason) return error.reason;
  if (error.message) {
    if (error.message.includes("user rejected")) {
      return "Transaction was rejected by the user";
    }
    return error.message;
  }
  return "An unknown error occurred";
}