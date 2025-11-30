import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon
}) => {
  const baseStyles = 'font-bold rounded-full transition-all inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400',
    secondary: 'border border-x-border hover:bg-x-hover disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50',
    ghost: 'hover:bg-x-hover disabled:opacity-50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} className="mr-2" />}
      {children}
    </button>
  );
};

export default Button;
