import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Trophy } from 'lucide-react';

const AchievementBadge = ({ 
  achievement,
  size = 'md', // sm, md, lg
  onClick,
  showProgress = false 
}) => {
  const { 
    name, 
    description, 
    rarity = 'common', 
    unlocked = false,
    progress = 0,
    icon: IconComponent,
    category
  } = achievement;

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40
  };

  // Rarity colors
  const rarityConfig = {
    common: {
      color: 'text-rarity-common',
      glow: 'shadow-none',
      border: 'border-rarity-common/30',
    },
    rare: {
      color: 'text-rarity-rare',
      glow: 'shadow-glow-purple',
      border: 'border-rarity-rare/50',
    },
    epic: {
      color: 'text-rarity-epic',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      border: 'border-rarity-epic/50',
    },
    legendary: {
      color: 'text-rarity-legendary',
      glow: 'shadow-glow-gold',
      border: 'border-rarity-legendary/50',
    },
  };

  const config = rarityConfig[rarity];
  const Icon = IconComponent || Trophy;

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Progress ring for in-progress achievements */}
      {showProgress && !unlocked && progress > 0 && (
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#00ff88"
            strokeWidth="3"
            strokeDasharray={`${progress * 2.827}, 282.7`}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Badge circle */}
      <div
        className={`
          w-full h-full rounded-full
          flex items-center justify-center
          border-2 ${config.border}
          ${unlocked ? `${config.glow} bg-gradient-to-br from-white/10 to-transparent` : 'bg-dark-tertiary/50'}
          ${unlocked ? config.color : 'text-gray-600'}
          backdrop-blur-sm
          transition-all duration-300
        `}
      >
        {unlocked ? (
          <Icon size={iconSizes[size]} strokeWidth={2} />
        ) : (
          <Lock size={iconSizes[size]} strokeWidth={2} className="text-gray-600" />
        )}
      </div>

      {/* Rarity indicator (small star in corner for rare+) */}
      {unlocked && rarity !== 'common' && (
        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-dark-base border ${config.border} flex items-center justify-center`}>
          <Star size={12} className={config.color} fill="currentColor" />
        </div>
      )}

      {/* Shimmer effect for legendary */}
      {unlocked && rarity === 'legendary' && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
        </div>
      )}
    </motion.div>
  );
};

export default AchievementBadge;
