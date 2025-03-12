import React from 'react';

const FallingLeaves = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}px`,
            animationDuration: `${5 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          <img 
            src={`/assets/ui/leaf-${1 + Math.floor(Math.random() * 3)}.png`}
            alt="leaf"
            className="w-8 h-8 animate-spin opacity-70"
            style={{ animationDuration: `${10 + Math.random() * 10}s` }}
          />
        </div>
      ))}
    </div>
  );
};

export default FallingLeaves;