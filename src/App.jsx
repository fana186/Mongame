import React from 'react';
import { GameProvider } from './contexts/GameContext';
import { WalletProvider } from './contexts/WalletContext';
import FruitMatchGame from './components/FruitMatchGame';
import './index.css'; // Import your global styles if needed

/**
 * Main App component that sets up context providers
 * This component wraps the entire application with necessary context providers
 * to ensure data is available to all child components
 */
const App = () => {
  return (
    <WalletProvider>
      <GameProvider>
        <div className="app-container">
          <FruitMatchGame />
        </div>
      </GameProvider>
    </WalletProvider>
  );
};

export default App;