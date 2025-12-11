import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  ...props 
}) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-glass
        border border-white/10
        shadow-glass
        ${hover ? 'hover:bg-white/[0.07] hover:shadow-glow-green hover:-translate-y-1 transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;