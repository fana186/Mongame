require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const MONAD_SCAN_API_KEY = process.env.MONAD_SCAN_API_KEY || "";
const MONAD_RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    monad_testnet: {
      url: MONAD_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 10143,
    }
  },
  etherscan: {
    apiKey: MONAD_SCAN_API_KEY
  },
  paths: {
    artifacts: "./src/contracts/artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test"
  },
};