import React from 'react';
import { motion } from 'framer-motion';

const GlassButton = ({ 
  children, 
  variant = 'primary', // 'primary', 'secondary', 'success', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon,
  iconPosition = 'left', // 'left', 'right'
  onClick,
  disabled = false,
  className = '',
  fullWidth = false,
  ...props 
}) => {
  const variants = {
    primary: {
      base: 'bg-xp-gradient text-white shadow-glow-green',
      hover: 'hover:shadow-[0_0_30px_rgba(0,255,136,0.5)]',
    },
    secondary: {
      base: 'bg-white/5 text-white border border-white/10',
      hover: 'hover:bg-white/10',
    },
    success: {
      base: 'bg-xp-green/20 text-xp-green border border-xp-green/30',
      hover: 'hover:bg-xp-green/30',
    },
    danger: {
      base: 'bg-red-500/20 text-red-500 border border-red-500/30',
      hover: 'hover:bg-red-500/30',
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];

  return (
    <motion.button
      className={`
        relative overflow-hidden
        rounded-xl font-medium
        backdrop-blur-sm
        flex items-center justify-center gap-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses.base}
        ${!disabled && variantClasses.hover}
        ${sizeClasses}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Shimmer effect on hover */}
      {!disabled && variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-shimmer bg-[length:200%_100%]" />
      )}

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} />}
        {children}
        {Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} />}
      </span>
    </motion.button>
  );
};

export default GlassButton;
