import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Lock, Trophy } from 'lucide-react';
import AchievementBadge from './AchievementBadge';

const AchievementModal = ({ achievement, isOpen, onClose }) => {
  if (!achievement) return null;

  const { 
    name, 
    description, 
    rarity = 'common',
    unlocked = false,
    unlockedAt,
    progress = 0,
    requirement,
    category,
    xpReward = 0
  } = achievement;

  const rarityConfig = {
    common: { name: 'Common', color: 'text-rarity-common', bg: 'bg-rarity-common/10' },
    rare: { name: 'Rare', color: 'text-rarity-rare', bg: 'bg-rarity-rare/10' },
    epic: { name: 'Epic', color: 'text-rarity-epic', bg: 'bg-rarity-epic/10' },
    legendary: { name: 'Legendary', color: 'text-rarity-legendary', bg: 'bg-rarity-legendary/10' },
  };

  const config = rarityConfig[rarity];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onClose}
          >
            <motion.div
              className="relative w-full max-w-md bg-dark-secondary/95 backdrop-blur-glass border border-white/10 rounded-3xl shadow-glass overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              layoutId={`achievement-${achievement.id}`}
            >
              {/* Header with close button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Gradient background based on rarity */}
              <div className={`absolute inset-0 opacity-10 ${
                rarity === 'legendary' ? 'bg-legendary-gradient' : 
                rarity === 'epic' ? 'bg-gradient-to-br from-rarity-epic to-transparent' :
                rarity === 'rare' ? 'bg-gradient-to-br from-rarity-rare to-transparent' :
                'bg-gradient-to-br from-white/5 to-transparent'
              }`} />

              <div className="relative p-8">
                {/* Badge Display */}
                <div className="flex justify-center mb-6">
                  <AchievementBadge 
                    achievement={achievement} 
                    size="lg"
                    showProgress={true}
                  />
                </div>

                {/* Rarity Badge */}
                <div className="flex justify-center mb-4">
                  <div className={`px-4 py-1 rounded-full ${config.bg} border border-white/10 flex items-center gap-2`}>
                    <Star size={14} className={config.color} fill="currentColor" />
                    <span className={`text-sm font-medium ${config.color}`}>
                      {config.name}
                    </span>
                  </div>
                </div>

                {/* Achievement Name */}
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  {name}
                </h2>

                {/* Category */}
                {category && (
                  <p className="text-sm text-gray-400 text-center mb-4">
                    {category}
                  </p>
                )}

                {/* Description */}
                <p className="text-gray-300 text-center mb-6">
                  {description}
                </p>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-6" />

                {/* Unlock Status */}
                {unlocked ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-xp-green">
                      <Trophy size={20} />
                      <span className="font-medium">Unlocked!</span>
                    </div>
                    {unlockedAt && (
                      <p className="text-sm text-gray-400 text-center">
                        Earned on {new Date(unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                    {xpReward > 0 && (
                      <div className="text-center">
                        <span className="text-xp-green font-bold">+{xpReward} XP</span>
                        <span className="text-gray-400 text-sm"> earned</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Lock Status */}
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Lock size={20} />
                      <span className="font-medium">Locked</span>
                    </div>

                    {/* Requirement */}
                    {requirement && (
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-sm text-gray-400 mb-2">How to unlock:</p>
                        <p className="text-white">{requirement}</p>
                      </div>
                    )}

                    {/* Progress bar if in progress */}
                    {progress > 0 && progress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-xp-green font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-xp-gradient"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* XP Reward preview */}
                    {xpReward > 0 && (
                      <div className="text-center text-sm">
                        <span className="text-gray-400">Reward: </span>
                        <span className="text-xp-green font-bold">+{xpReward} XP</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AchievementModal;
