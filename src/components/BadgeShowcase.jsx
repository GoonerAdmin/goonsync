import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AchievementBadge from './AchievementBadge';
import AchievementModal from './AchievementModal';

const BadgeShowcase = ({ achievements = [], columns = 4 }) => {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked', 'common', 'rare', 'epic', 'legendary'

  // Filter achievements
  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    if (['common', 'rare', 'epic', 'legendary'].includes(filter)) {
      return achievement.rarity === filter;
    }
    return true;
  });

  // Stats
  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const completionRate = Math.round((unlockedCount / totalAchievements) * 100);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Achievements</h2>
          <p className="text-gray-400">
            {unlockedCount} / {totalAchievements} unlocked ({completionRate}%)
          </p>
        </div>

        {/* Progress ring */}
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="50%"
              cy="50%"
              r="28"
              fill="none"
              stroke="#00ff88"
              strokeWidth="4"
              strokeDasharray={`${completionRate * 1.76}, 176`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xp-green font-bold text-sm">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'unlocked', label: 'Unlocked' },
          { value: 'locked', label: 'Locked' },
          { value: 'common', label: 'Common' },
          { value: 'rare', label: 'Rare' },
          { value: 'epic', label: 'Epic' },
          { value: 'legendary', label: 'Legendary' },
        ].map((filterOption) => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${filter === filterOption.value
                ? 'bg-xp-gradient text-white shadow-glow-green'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }
            `}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div 
        className="grid gap-6"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` 
        }}
      >
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id || index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-2"
          >
            <AchievementBadge
              achievement={achievement}
              size="md"
              onClick={() => setSelectedAchievement(achievement)}
              showProgress={true}
            />
            
            {/* Badge name */}
            <div className="text-center">
              <p className={`text-sm font-medium ${
                achievement.unlocked ? 'text-white' : 'text-gray-500'
              }`}>
                {achievement.name}
              </p>
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No achievements found with this filter.</p>
        </div>
      )}

      {/* Achievement Modal */}
      <AchievementModal
        achievement={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
};

export default BadgeShowcase;
