// Achievement Unlock Notification Component
// src/components/AchievementNotification.js

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';

const AchievementNotification = ({ achievements, onClose }) => {
  if (!achievements || achievements.length === 0) return null;

  // Show first achievement (if multiple unlocked, show one at a time)
  const achievement = achievements[0];

  const difficultyColors = {
    easy: '#10B981',
    medium: '#3B82F6',
    hard: '#8B5CF6',
    elite: '#F59E0B',
    ultimate: '#EF4444'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div 
          className="bg-gray-900 border-2 rounded-2xl p-5 shadow-2xl"
          style={{ borderColor: difficultyColors[achievement.difficulty] }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-white transition"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${difficultyColors[achievement.difficulty]}, ${difficultyColors[achievement.difficulty]}88)` 
              }}
            >
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Achievement Unlocked!</p>
              <h3 className="font-bold text-lg">{achievement.name}</h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>

          {/* XP Reward */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star size={16} className="text-yellow-500" fill="currentColor" />
              <span className="font-bold text-yellow-500">+{achievement.xp} XP</span>
            </div>
            
            <span 
              className="text-xs font-bold uppercase px-2 py-1 rounded"
              style={{ 
                backgroundColor: `${difficultyColors[achievement.difficulty]}22`,
                color: difficultyColors[achievement.difficulty]
              }}
            >
              {achievement.difficulty}
            </span>
          </div>

          {/* Multiple achievements indicator */}
          {achievements.length > 1 && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              +{achievements.length - 1} more achievement{achievements.length > 2 ? 's' : ''}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Level Up Notification Component
export const LevelUpNotification = ({ oldLevel, newLevel, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{ 
            repeat: 3, 
            repeatType: 'reverse', 
            duration: 0.2 
          }}
          className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-8 shadow-2xl pointer-events-auto"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Trophy size={64} className="text-white mx-auto mb-4" />
            </motion.div>
            
            <h2 className="text-4xl font-bold text-white mb-2">LEVEL UP!</h2>
            <p className="text-2xl font-bold text-white/90 mb-4">
              Level {oldLevel} → {newLevel}
            </p>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white text-orange-600 rounded-full font-bold hover:bg-gray-100 transition"
            >
              Awesome!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementNotification;
