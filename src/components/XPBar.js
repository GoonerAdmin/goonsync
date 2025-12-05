// XP Progress Bar Component
// src/components/XPBar.js

import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { getLevelFromXP, getProgressToNextLevel, LEVEL_SYSTEM } from '../utils/achievements';

const XPBar = ({ totalXP, currentLevel }) => {
  const progress = getProgressToNextLevel(totalXP);
  const levelInfo = LEVEL_SYSTEM[currentLevel - 1];
  
  if (!levelInfo) return null;

  const { xpRequired, xpForNext, currentXP } = progress;
  const percentage = xpForNext > 0 ? (currentXP / xpForNext) * 100 : 100;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      {/* Level Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}99)` 
            }}
          >
            <Trophy size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-lg">Level {currentLevel}</h3>
              <Star size={16} className="text-yellow-500" />
            </div>
            <p className="text-sm text-gray-400">{levelInfo.title}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-400">Total XP</p>
          <p className="font-bold">{totalXP.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            {currentXP.toLocaleString()} / {xpForNext.toLocaleString()} XP
          </span>
          <span className="text-gray-400">
            {Math.floor(percentage)}%
          </span>
        </div>
        
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}dd)`
            }}
          />
        </div>
        
        {currentLevel < 50 && (
          <p className="text-xs text-gray-500 text-center">
            {(xpForNext - currentXP).toLocaleString()} XP to Level {currentLevel + 1}
          </p>
        )}
        
        {currentLevel === 50 && (
          <p className="text-xs text-center font-bold" style={{ color: levelInfo.color }}>
            🔥 MAX LEVEL: THE GOON GOD 🔥
          </p>
        )}
      </div>
    </div>
  );
};

export default XPBar;
