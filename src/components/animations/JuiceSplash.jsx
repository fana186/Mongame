import React from 'react';

const JuiceSplash = ({ x, y, color, onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 800); // Match animation duration
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      <div 
        className="absolute w-16 h-16 rounded-full"
        style={{
          backgroundColor: color || '#FFD700',
          opacity: 0.7,
          transform: 'scale(0)',
          animation: 'splash-grow 0.8s ease-out forwards'
        }}
      />
    </div>
  );
};

export default JuiceSplash;