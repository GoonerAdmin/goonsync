import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

const XPBar = ({ currentXP, level, nextLevelXP, showLevel = true, size = 'md' }) => {
  const [displayXP, setDisplayXP] = useState(0);
  const progress = (currentXP / nextLevelXP) * 100;

  useEffect(() => {
    setDisplayXP(currentXP);
  }, [currentXP]);

  // Size variants
  const sizes = {
    sm: { height: 'h-2', text: 'text-sm', padding: 'p-3' },
    md: { height: 'h-3', text: 'text-base', padding: 'p-4' },
    lg: { height: 'h-4', text: 'text-lg', padding: 'p-5' },
  };

  const { height, text, padding } = sizes[size];

  return (
    <div className="w-full">
      {/* Level badge and XP counter */}
      {showLevel && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Level badge */}
            <motion.div
              className="relative w-12 h-12 rounded-xl bg-xp-gradient flex items-center justify-center shadow-glow-green"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-white font-bold text-lg">{level}</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-achievement-gold rounded-full flex items-center justify-center">
                <span className="text-dark-base text-[8px] font-bold">LVL</span>
              </div>
            </motion.div>

            {/* XP Text */}
            <div>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter 
                  value={displayXP} 
                  className="text-xp-green font-bold text-xl"
                />
                <span className="text-gray-400 text-sm">/ {nextLevelXP} XP</span>
              </div>
              <p className="text-gray-500 text-xs">
                {nextLevelXP - currentXP} XP to level {level + 1}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Glass XP bar */}
      <div className={`relative w-full ${height} rounded-full overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-glass`}>
        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-xp-gradient shadow-glow-green"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
      </div>

      {/* Progress percentage (optional) */}
      <div className="mt-1 text-right">
        <span className="text-xp-green text-xs font-medium">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export default XPBar;
