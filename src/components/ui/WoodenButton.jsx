import React from 'react';

/**
 * WoodenButton component - A styled wooden button for the Fruit Match game
 * 
 * @param {Object} props
 * @param {string} props.label - Button text
 * @param {Function} props.onClick - Click handler
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {string} props.variant - Button style variant (primary, secondary, success, danger)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {ReactNode} props.icon - Optional icon to display
 * @param {string} props.className - Additional CSS classes
 */
const WoodenButton = ({
  label,
  onClick,
  size = "md",
  variant = "primary",
  disabled = false,
  icon,
  className = "",
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  // Variant styles
  const getVariantStyle = () => {
    switch(variant) {
      case 'secondary':
        return {
          background: "linear-gradient(to bottom, #8D6E63, #5D4037)",
          border: "2px solid #4E342E",
          boxShadow: "0 4px 0 #3E2723, 0 6px 10px rgba(0,0,0,0.25)"
        };
      case 'success':
        return {
          background: "linear-gradient(to bottom, #66BB6A, #43A047)",
          border: "2px solid #2E7D32",
          boxShadow: "0 4px 0 #1B5E20, 0 6px 10px rgba(0,0,0,0.25)"
        };
      case 'danger':
        return {
          background: "linear-gradient(to bottom, #EF5350, #D32F2F)",
          border: "2px solid #C62828",
          boxShadow: "0 4px 0 #B71C1C, 0 6px 10px rgba(0,0,0,0.25)"
        };
      case 'primary':
      default:
        return {
          background: "linear-gradient(to bottom, #A1887F, #795548)",
          border: "2px solid #5D4037",
          boxShadow: "0 4px 0 #4E342E, 0 6px 10px rgba(0,0,0,0.25)"
        };
    }
  };

  const buttonStyle = {
    ...getVariantStyle(),
    transform: disabled ? "translateY(2px)" : "translateY(0)",
    opacity: disabled ? 0.7 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
  
  // Active/pressed state
  const handleMouseDown = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "translateY(4px)";
      e.currentTarget.style.boxShadow = "0 1px 0 #3E2723, 0 2px 3px rgba(0,0,0,0.25)";
    }
  };
  
  const handleMouseUp = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = getVariantStyle().boxShadow;
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`rounded-lg font-semibold text-white relative transition-all duration-100 
        flex items-center justify-center gap-2 ${sizeClasses[size]} ${className}`}
      style={buttonStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={disabled}
      {...props}
    >
      {/* Wooden grain texture overlay */}
      <div 
        className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/ui/wooden-panel.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          mixBlendMode: "overlay"
        }}
      />
      
      {/* Button content */}
      <div className="flex items-center justify-center gap-2 z-10">
        {icon && <span className="w-5 h-5">{icon}</span>}
        {label}
      </div>
    </button>
  );
};

export default WoodenButton;