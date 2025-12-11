import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User, Calendar, Trophy, Zap, Users, Target } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import XPBar from '../components/XPBar';
import BadgeShowcase from '../components/BadgeShowcase';
import StatCard from '../components/StatCard';
import GlassButton from '../components/GlassButton';

const ProfileView = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    circlesJoined: 0,
    daysActive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch profile by username
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      setProfile(profileData);
      setIsOwnProfile(user?.id === profileData.id);

      // Load achievements (mock data for now - replace with your actual achievements)
      const mockAchievements = [
        {
          id: 1,
          name: 'First Sync',
          description: 'Complete your first sync session',
          rarity: 'common',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          icon: Zap,
          requirement: 'Join your first sync session',
          xpReward: 100,
        },
        {
          id: 2,
          name: 'Social Butterfly',
          description: 'Join 5 different circles',
          rarity: 'rare',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          icon: Users,
          requirement: 'Join 5 circles',
          xpReward: 250,
        },
        {
          id: 3,
          name: 'Dedicated',
          description: 'Sync for 7 days in a row',
          rarity: 'epic',
          unlocked: false,
          progress: 42,
          icon: Calendar,
          requirement: 'Sync every day for 7 days straight',
          xpReward: 500,
        },
        {
          id: 4,
          name: 'Legend',
          description: 'Reach level 50',
          rarity: 'legendary',
          unlocked: false,
          progress: 0,
          icon: Trophy,
          requirement: 'Reach level 50',
          xpReward: 1000,
        },
      ];

      setAchievements(mockAchievements);

      // Load stats (replace with actual queries)
      setStats({
        totalSessions: 24,
        circlesJoined: 8,
        daysActive: 12,
      });

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-gray-400 mb-6">This user doesn't exist.</p>
          <GlassButton onClick={() => navigate('/')}>
            Go Home
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <GlassCard className="p-8" hover={false}>
          <div className="flex items-start justify-between mb-6">
            {/* Profile Info */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-xp-gradient flex items-center justify-center shadow-glow-green">
                <User size={48} className="text-white" />
              </div>

              {/* Name & Username */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-gray-400 text-lg">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-300 mt-2 max-w-md">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Action Button */}
            {isOwnProfile && (
              <GlassButton 
                variant="secondary"
                onClick={() => navigate('/settings')}
              >
                Edit Profile
              </GlassButton>
            )}
          </div>

          {/* XP Bar */}
          <XPBar 
            currentXP={profile.experience_points}
            level={profile.level}
            nextLevelXP={profile.level * 100}
            size="lg"
          />
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Zap}
            label="Total Sessions"
            value={stats.totalSessions}
            color="xp-green"
          />
          <StatCard
            icon={Users}
            label="Circles Joined"
            value={stats.circlesJoined}
            color="rarity-rare"
          />
          <StatCard
            icon={Calendar}
            label="Days Active"
            value={stats.daysActive}
            color="rarity-epic"
          />
        </div>

        {/* Achievements Section */}
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

export default ProfileView;
