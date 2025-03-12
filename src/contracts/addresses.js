// Contract addresses for the Monad Testnet (Chain ID: 10143)
export const CONTRACT_ADDRESSES = {
    // Monad Testnet
    10143: {
      // Note: According to your information, both contracts have the same address
      // If this is not correct, please update the second address
      FruitGame: "0xee66c31aeD56C3A6E7197C3D50D413Fd586B9ba2",
      MONToken: "0x27a2807f41248ba8FBa9C70Cf6c415F3c9906Dcf" 
    }
  };
  
  // Default to Monad Testnet
  export const DEFAULT_CHAIN_ID = 10143;
  
  // Get contract address based on chain ID
  export const getContractAddress = (contractName, chainId = DEFAULT_CHAIN_ID) => {
    return CONTRACT_ADDRESSES[chainId]?.[contractName] || null;
  };