import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtext,
  trend, // 'up', 'down', or null
  color = 'xp-green',
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32
  };

  const textSizes = {
    sm: { value: 'text-xl', label: 'text-xs' },
    md: { value: 'text-2xl', label: 'text-sm' },
    lg: { value: 'text-3xl', label: 'text-base' }
  };

  return (
    <GlassCard className={sizeClasses[size]} hover={false}>
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`p-2 rounded-lg bg-${color}/10 border border-${color}/20`}>
          <Icon size={iconSizes[size]} className={`text-${color}`} />
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-xp-green/10 text-xp-green' : 'bg-red-500/10 text-red-500'
          }`}>
            {trend === 'up' ? '↑' : '↓'}
          </div>
        )}
      </div>

      {/* Value */}
      <motion.div 
        className={`${textSizes[size].value} font-bold text-white mt-3`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {value}
      </motion.div>

      {/* Label */}
      <div className={`${textSizes[size].label} text-gray-400 mt-1`}>
        {label}
      </div>

      {/* Subtext */}
      {subtext && (
        <div className="text-xs text-gray-500 mt-2">
          {subtext}
        </div>
      )}
    </GlassCard>
  );
};

export default StatCard;
