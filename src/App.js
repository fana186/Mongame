import React from 'react';
import FruitMatchGame from './components/FruitMatchGame';
import { GameProvider } from './contexts/GameContext';
import { WalletProvider } from './contexts/WalletContext';
import { SoundProvider } from './contexts/SoundContext';

function App() {
  return (
    <WalletProvider>
      <SoundProvider>
        <GameProvider>
          <div className="min-h-screen w-full bg-gradient-to-b from-emerald-700 to-emerald-900 py-8">
            <FruitMatchGame />
          </div>
        </GameProvider>
      </SoundProvider>
    </WalletProvider>
  );
}

export default App;