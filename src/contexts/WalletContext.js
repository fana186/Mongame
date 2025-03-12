import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  BrowserProvider, 
  Contract,
  formatEther,
  parseEther
} from 'ethers';

// Import contract ABIs and addresses
import FruitGameABI from '../contracts/abis/FruitGame.json';
import MONTokenABI from '../contracts/abis/MONToken.json';

// Contract addresses
const FRUIT_GAME_ADDRESS = '0xee66c31aeD56C3A6E7197C3D50D413Fd586B9ba2';
const MON_TOKEN_ADDRESS = '0x27a2807f41248ba8FBa9C70Cf6c415F3c9906Dcf';

// Create context
const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [balance, setBalance] = useState('0');
  const [connectionError, setConnectionError] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh token balance
  const refreshBalance = useCallback(async (address, contract) => {
    if (!address || !contract) return '0';
    
    try {
      const userBalance = await contract.balanceOf(address);
      const formattedBalance = formatEther(userBalance);
      setBalance(formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }, []);

  // Initialize connection to browser's Web3 provider
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setConnectionError('No Ethereum wallet found. Please install MetaMask or another compatible wallet.');
      return false;
    }

    try {
      setIsLoading(true);
      setConnectionError(null);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Create ethers provider
      const ethersProvider = new BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      
      // Create contract instances
      const gameContractInstance = new Contract(
        FRUIT_GAME_ADDRESS,
        FruitGameABI,
        ethersSigner
      );
      
      const tokenContractInstance = new Contract(
        MON_TOKEN_ADDRESS,
        MONTokenABI,
        ethersSigner
      );
      
      // Update state
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setWalletAddress(address);
      setGameContract(gameContractInstance);
      setTokenContract(tokenContractInstance);
      setIsConnected(true);
      
      // Get token balance
      await refreshBalance(address, tokenContractInstance);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionError(error.message || 'Failed to connect wallet');
      setIsLoading(false);
      return false;
    }
  }, [refreshBalance]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setWalletAddress('');
    setProvider(null);
    setSigner(null);
    setGameContract(null);
    setTokenContract(null);
    setBalance('0');
  }, []);

  // Send tokens
  const sendTokens = async (recipient, amount) => {
    if (!isConnected || !tokenContract) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      const parsedAmount = parseEther(amount);
      
      // Send transaction
      const tx = await tokenContract.transfer(recipient, parsedAmount);
      
      // Add to transaction history
      const newTx = {
        hash: tx.hash,
        type: 'send',
        recipient,
        amount,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      setTransactionHistory(prev => [newTx, ...prev]);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Update transaction status
      setTransactionHistory(prev => 
        prev.map(t => t.hash === tx.hash ? { ...t, status: 'confirmed' } : t)
      );
      
      // Refresh balance
      await refreshBalance(walletAddress, tokenContract);
      
      setIsLoading(false);
      return receipt;
    } catch (error) {
      console.error('Error sending tokens:', error);
      
      // Update transaction status if it was added to history
      if (error.transaction?.hash) {
        setTransactionHistory(prev => 
          prev.map(t => t.hash === error.transaction.hash ? { ...t, status: 'failed' } : t)
        );
      }
      
      setIsLoading(false);
      throw error;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          // Account changed, update state
          setWalletAddress(accounts[0]);
          if (tokenContract) {
            await refreshBalance(accounts[0], tokenContract);
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Clean up listener on unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [walletAddress, tokenContract, disconnectWallet, refreshBalance]);

  // Check initial connection
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);
    }
  }, [connectWallet]);

  // Provide context value
  const contextValue = {
    isConnected,
    walletAddress,
    provider,
    signer,
    gameContract,
    tokenContract,
    balance,
    connectionError,
    transactionHistory,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalance: () => tokenContract ? refreshBalance(walletAddress, tokenContract) : '0',
    sendTokens
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;