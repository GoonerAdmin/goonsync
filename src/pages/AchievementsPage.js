// Achievements Page Component
// src/pages/AchievementsPage.js

import React, { useState, useEffect } from 'react';
import { Trophy, Lock, Star, Award, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { ACHIEVEMENTS } from '../utils/achievements';

const AchievementsPage = ({ user, supabase }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, xp_awarded')
        .eq('user_id', user.id);
      
      setUnlockedAchievements(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      setLoading(false);
    }
  };

  const unlockedIds = new Set(unlockedAchievements.map(a => a.achievement_id));
  
  // Filter achievements
  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    if (filter === 'unlocked') return unlockedIds.has(achievement.id);
    if (filter === 'locked') return !unlockedIds.has(achievement.id);
    return true;
  });

  // Group by difficulty
  const groupedAchievements = {
    easy: filteredAchievements.filter(a => a.difficulty === 'easy'),
    medium: filteredAchievements.filter(a => a.difficulty === 'medium'),
    hard: filteredAchievements.filter(a => a.difficulty === 'hard'),
    elite: filteredAchievements.filter(a => a.difficulty === 'elite'),
    ultimate: filteredAchievements.filter(a => a.difficulty === 'ultimate')
  };

  const difficultyColors = {
    easy: '#10B981',
    medium: '#3B82F6',
    hard: '#8B5CF6',
    elite: '#F59E0B',
    ultimate: '#EF4444'
  };

  const difficultyLabels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    elite: 'Elite',
    ultimate: 'Ultimate'
  };

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold">Achievements</h2>
              <p className="text-gray-400 text-sm">
                {unlockedCount} / {totalCount} unlocked ({Math.floor((unlockedCount / totalCount) * 100)}%)
              </p>
            </div>
            <div className="h-16 w-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Trophy size={32} className="text-white" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 px-4 pb-3 overflow-x-auto">
          <Filter size={16} className="text-gray-500" />
          {['all', 'unlocked', 'locked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="p-4 space-y-8">
        {Object.entries(groupedAchievements).map(([difficulty, achievements]) => {
          if (achievements.length === 0) return null;
          
          return (
            <div key={difficulty}>
              <div className="flex items-center space-x-2 mb-4">
                <div 
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: difficultyColors[difficulty] }}
                />
                <h3 
                  className="font-bold text-sm uppercase tracking-wide"
                  style={{ color: difficultyColors[difficulty] }}
                >
                  {difficultyLabels[difficulty]}
                </h3>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map((achievement, index) => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  const unlockedData = unlockedAchievements.find(a => a.achievement_id === achievement.id);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border rounded-xl p-4 transition ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'
                          : 'bg-gray-900/50 border-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div 
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            isUnlocked ? 'bg-gradient-to-br' : 'bg-gray-800'
                          }`}
                          style={isUnlocked ? {
                            backgroundImage: `linear-gradient(135deg, ${difficultyColors[difficulty]}, ${difficultyColors[difficulty]}88)`
                          } : {}}
                        >
                          {isUnlocked ? (
                            <Award size={20} className="text-white" />
                          ) : (
                            <Lock size={20} className="text-gray-600" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-bold">{achievement.xp}</span>
                        </div>
                      </div>

                      <h4 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        {achievement.name}
                      </h4>
                      
                      <p className={`text-sm mb-2 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {achievement.description}
                      </p>

                      {isUnlocked && unlockedData && (
                        <p className="text-xs text-gray-500">
                          Unlocked {new Date(unlockedData.unlocked_at).toLocaleDateString()}
                        </p>
                      )}

                      {!isUnlocked && (
                        <div className="flex items-center space-x-1 text-gray-600 text-xs">
                          <Lock size={12} />
                          <span>Locked</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Trophy size={48} className="text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg mb-2">No achievements found</p>
          <p className="text-gray-600 text-sm">Try a different filter</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
