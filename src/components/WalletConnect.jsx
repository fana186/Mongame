import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const WalletConnect = ({ onConnect }) => {
  const { connectWallet, account, disconnect, isConnecting } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  // Format the wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      onConnect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative">
      {account ? (
        <div className="flex items-center">
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg shadow-md hover:bg-amber-800 transition-all flex items-center"
            style={{
              border: "2px solid #8D6E63",
              boxShadow: "0 4px 0 #5D4037"
            }}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            {formatAddress(account)}
            <span className="ml-2">▼</span>
          </button>
          
          {showDropdown && (
            <div 
              className="absolute right-0 top-12 bg-amber-800 text-white rounded-lg shadow-lg p-2 z-10 animate-fadeIn"
              style={{
                border: "2px solid #8D6E63",
              }}
            >
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-amber-900 rounded"
              >
                Disconnect
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(account);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-amber-900 rounded"
              >
                Copy Address
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-all ${
            isConnecting ? 'opacity-70 cursor-wait' : ''
          }`}
          style={{
            border: "2px solid #B39DDB",
            boxShadow: "0 4px 0 #673AB7"
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;