import React, { useState, useEffect } from 'react';
import { Trophy, Lock, Star, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';
import BadgeShowcase from './BadgeShowcase';
import StatCard from './StatCard';

const AchievementsView = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    // Mock achievements - replace with actual Supabase query
    const mockAchievements = [
      {
        id: 1,
        name: 'First Sync',
        description: 'Complete your first sync session',
        category: 'Getting Started',
        rarity: 'common',
        unlocked: true,
        unlockedAt: '2024-12-01T10:00:00Z',
        icon: Trophy,
        requirement: 'Join your first sync session',
        xpReward: 100,
      },
      {
        id: 2,
        name: 'Social Butterfly',
        description: 'Join 5 different circles',
        category: 'Social',
        rarity: 'rare',
        unlocked: true,
        unlockedAt: '2024-12-05T15:30:00Z',
        icon: Trophy,
        requirement: 'Join 5 circles',
        xpReward: 250,
      },
      {
        id: 3,
        name: 'Dedicated',
        description: 'Sync for 7 days in a row',
        category: 'Commitment',
        rarity: 'epic',
        unlocked: false,
        progress: 42,
        icon: Trophy,
        requirement: 'Sync every day for 7 days straight',
        xpReward: 500,
      },
      {
        id: 4,
        name: 'Legend',
        description: 'Reach level 50',
        category: 'Progression',
        rarity: 'legendary',
        unlocked: false,
        progress: 0,
        icon: Trophy,
        requirement: 'Reach level 50',
        xpReward: 1000,
      },
      {
        id: 5,
        name: 'Night Owl',
        description: 'Sync between 12am and 4am',
        category: 'Special',
        rarity: 'rare',
        unlocked: false,
        progress: 0,
        icon: Trophy,
        requirement: 'Complete a sync session between midnight and 4am',
        xpReward: 200,
      },
      {
        id: 6,
        name: 'Early Bird',
        description: 'Sync between 5am and 7am',
        category: 'Special',
        rarity: 'rare',
        unlocked: false,
        progress: 0,
        icon: Trophy,
        requirement: 'Complete a sync session between 5am and 7am',
        xpReward: 200,
      },
      {
        id: 7,
        name: 'Squad Leader',
        description: 'Create 3 circles',
        category: 'Leadership',
        rarity: 'epic',
        unlocked: false,
        progress: 33,
        icon: Trophy,
        requirement: 'Create 3 different circles',
        xpReward: 400,
      },
      {
        id: 8,
        name: 'Popular',
        description: 'Have 20 people in your circles',
        category: 'Social',
        rarity: 'epic',
        unlocked: false,
        progress: 15,
        icon: Trophy,
        requirement: 'Reach a combined total of 20 members across all your circles',
        xpReward: 500,
      },
    ];

    setAchievements(mockAchievements);
    setLoading(false);
  };

  // Calculate stats
  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXPEarned = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);
  const inProgressCount = achievements.filter(a => !a.unlocked && a.progress > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="text-white text-xl">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Achievement Gallery
          </h1>
          <p className="text-xl text-gray-400">
            Track your progress and unlock exclusive badges
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Trophy}
            label="Achievements Unlocked"
            value={`${unlockedCount}/${totalAchievements}`}
            color="achievement-gold"
          />
          <StatCard
            icon={Star}
            label="Total XP Earned"
            value={totalXPEarned}
            color="xp-green"
          />
          <StatCard
            icon={TrendingUp}
            label="In Progress"
            value={inProgressCount}
            color="rarity-epic"
          />
          <StatCard
            icon={Lock}
            label="Locked"
            value={totalAchievements - unlockedCount}
            color="rarity-common"
          />
        </div>

        {/* Achievement Categories Info */}
        <GlassCard className="p-6" hover={false}>
          <h2 className="text-2xl font-bold text-white mb-4">Rarity Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-rarity-common" />
              <div>
                <p className="text-white font-medium">Common</p>
                <p className="text-xs text-gray-400">Easy to unlock</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-rarity-rare" />
              <div>
                <p className="text-white font-medium">Rare</p>
                <p className="text-xs text-gray-400">Requires dedication</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-rarity-epic" />
              <div>
                <p className="text-white font-medium">Epic</p>
                <p className="text-xs text-gray-400">Impressive feat</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-rarity-legendary" />
              <div>
                <p className="text-white font-medium">Legendary</p>
                <p className="text-xs text-gray-400">Ultimate mastery</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Main Achievement Grid */}
        <GlassCard className="p-8" hover={false}>
          <BadgeShowcase 
            achievements={achievements}
            columns={4}
          />
        </GlassCard>
      </div>
    </div>
  );
};

export default AchievementsView;
