import React from 'react';

/**
 * StarRating component for displaying level progress with filled/empty stars
 * 
 * @param {Object} props
 * @param {number} props.rating - Current star rating (0-3)
 * @param {number} props.maxRating - Maximum possible rating (default: 3)
 * @param {string} props.size - Size of stars (sm, md, lg)
 * @param {boolean} props.animate - Whether to animate stars when they appear
 */
const StarRating = ({ 
  rating = 0, 
  maxRating = 3, 
  size = "md", 
  animate = false 
}) => {
  // Determine star size based on prop
  const getStarSize = () => {
    switch(size) {
      case 'sm': return 'w-6 h-6';
      case 'lg': return 'w-12 h-12';
      case 'md':
      default: return 'w-8 h-8';
    }
  };

  const starSize = getStarSize();
  
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < rating;
        const animationClass = animate && isFilled ? 'animate-bounce' : '';
        
        return (
          <div 
            key={`star-${index}`}
            className={`${starSize} ${animationClass} transform transition-all duration-300 ${isFilled ? 'scale-110' : 'scale-100'}`}
            style={{
              backgroundImage: isFilled 
                ? "url('/assets/ui/star-filled.png')" 
                : "url('/assets/ui/star-empty.png')",
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: isFilled ? 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.7))' : 'none'
            }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;