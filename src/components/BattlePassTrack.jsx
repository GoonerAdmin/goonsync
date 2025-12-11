import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, CheckCircle } from 'lucide-react';

const BattlePassTrack = ({ currentLevel, maxLevel = 50 }) => {
  // Show 5 levels at a time (2 before, current, 2 after)
  const getVisibleLevels = () => {
    const start = Math.max(1, currentLevel - 2);
    const end = Math.min(maxLevel, currentLevel + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visibleLevels = getVisibleLevels();

  return (
    <div className="w-full overflow-hidden">
      {/* Track container */}
      <div className="relative py-8">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2" />
        
        {/* Completed line */}
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-xp-gradient shadow-glow-green -translate-y-1/2"
          initial={{ width: 0 }}
          animate={{ width: `${(currentLevel / maxLevel) * 100}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Level nodes */}
        <div className="relative flex justify-between items-center px-4">
          {visibleLevels.map((level) => {
            const isPast = level < currentLevel;
            const isCurrent = level === currentLevel;
            const isFuture = level > currentLevel;

            return (
              <motion.div
                key={level}
                className="flex flex-col items-center gap-2 relative z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: level * 0.1 }}
              >
                {/* Node circle */}
                <motion.div
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    border-2 backdrop-blur-sm transition-all duration-300
                    ${isPast ? 'bg-xp-gradient border-xp-green shadow-glow-green' : ''}
                    ${isCurrent ? 'bg-xp-gradient border-xp-green shadow-glow-green animate-pulse-glow' : ''}
                    ${isFuture ? 'bg-dark-tertiary/50 border-white/10' : ''}
                  `}
                  whileHover={{ scale: 1.1 }}
                >
                  {isPast && <CheckCircle size={28} className="text-white" />}
                  {isCurrent && <Trophy size={28} className="text-white" />}
                  {isFuture && <Lock size={28} className="text-gray-600" />}
                </motion.div>

                {/* Level number */}
                <div className={`
                  text-sm font-bold
                  ${isCurrent ? 'text-xp-green' : ''}
                  ${isPast ? 'text-white' : ''}
                  ${isFuture ? 'text-gray-600' : ''}
                `}>
                  {level}
                </div>

                {/* Reward preview (optional) */}
                {level % 5 === 0 && (
                  <div className="absolute -bottom-8 flex flex-col items-center">
                    <div className="w-1 h-4 bg-white/20" />
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                      ${isFuture ? 'bg-white/5 text-gray-500' : 'bg-achievement-gold/20 text-achievement-gold border border-achievement-gold/30'}
                    `}>
                      🏆 Reward
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Level range indicator */}
        <div className="flex justify-between mt-8 px-4 text-xs text-gray-500">
          <span>Level {visibleLevels[0]}</span>
          <span className="text-xp-green font-medium">
            {currentLevel} / {maxLevel}
          </span>
          <span>Level {visibleLevels[visibleLevels.length - 1]}</span>
        </div>
      </div>
    </div>
  );
};

export default BattlePassTrack;
