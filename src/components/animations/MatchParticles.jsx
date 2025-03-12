import React from 'react';

const MatchParticles = ({ x, y, color }) => {
  const particleCount = 20;
  
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * 2 * Math.PI;
        const speed = 2 + Math.random() * 3;
        
        return (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-fadeOut"
            style={{
              backgroundColor: color || '#FFD700',
              transform: `translate(${Math.cos(angle) * speed * 20}px, ${Math.sin(angle) * speed * 20}px)`,
              opacity: 0,
              animation: 'particle-fade 0.8s ease-out forwards'
            }}
          />
        );
      })}
    </div>
  );
};

export default MatchParticles;