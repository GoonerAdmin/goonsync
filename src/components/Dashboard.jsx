import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Users, Zap, Trophy, Plus, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';
import XPBar from './XPBar';
import BattlePassTrack from './BattlePassTrack';
import StatCard from './StatCard';
import GlassButton from './GlassButton';
import SyncCard from './SyncCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [circles, setCircles] = useState([]);
  const [activeSyncs, setActiveSyncs] = useState([]);
  const [todayXP, setTodayXP] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Load circles
      const { data: circlesData } = await supabase
        .from('circle_members')
        .select(`
          circle_id,
          circles (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq('user_id', user.id);

      setCircles(circlesData?.map(c => c.circles) || []);

      // Load active syncs
      const { data: syncsData } = await supabase
        .from('active_syncs')
        .select('*')
        .eq('user_id', user.id);

      setActiveSyncs(syncsData || []);

      // Calculate today's XP (mock for now)
      setTodayXP(150);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {profile?.full_name || profile?.username}!
            </h1>
            <p className="text-gray-400">Ready to level up today?</p>
          </div>

          <GlassButton 
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/circles')}
          >
            New Circle
          </GlassButton>
        </div>

        {/* Battle Pass Track */}
        <GlassCard className="p-6" hover={false}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-1">Level Progression</h2>
            <p className="text-gray-400">Your journey to greatness</p>
          </div>
          <BattlePassTrack 
            currentLevel={profile?.level || 1}
            maxLevel={50}
          />
        </GlassCard>

        {/* XP Progress */}
        <GlassCard className="p-6" hover={false}>
          <XPBar 
            currentXP={profile?.experience_points || 0}
            level={profile?.level || 1}
            nextLevelXP={(profile?.level || 1) * 100}
            size="lg"
          />
        </GlassCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="XP Gained Today"
            value={`+${todayXP}`}
            trend="up"
            color="xp-green"
          />
          <StatCard
            icon={Users}
            label="Active Circles"
            value={circles.length}
            color="rarity-rare"
          />
          <StatCard
            icon={Zap}
            label="Active Sessions"
            value={activeSyncs.length}
            color="rarity-epic"
          />
          <StatCard
            icon={Trophy}
            label="Achievements"
            value="2/47"
            color="achievement-gold"
          />
        </div>

        {/* Active Syncs */}
        {activeSyncs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Active Syncs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSyncs.map((sync) => (
                <SyncCard key={sync.id} sync={sync} />
              ))}
            </div>
          </div>
        )}

        {/* Your Circles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Circles</h2>
            <GlassButton 
              variant="secondary"
              size="sm"
              onClick={() => navigate('/circles')}
            >
              View All
            </GlassButton>
          </div>

          {circles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {circles.slice(0, 6).map((circle) => (
                <GlassCard 
                  key={circle.id}
                  className="p-6 cursor-pointer"
                  onClick={() => navigate(`/circles/${circle.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-xp-gradient/20 border border-xp-green/30 flex items-center justify-center flex-shrink-0">
                      <Users size={24} className="text-xp-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {circle.name}
                      </h3>
                      {circle.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {circle.description}
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <Users size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Circles Yet</h3>
              <p className="text-gray-400 mb-6">
                Create or join a circle to start syncing with others!
              </p>
              <GlassButton 
                variant="primary"
                icon={Plus}
                onClick={() => navigate('/circles')}
              >
                Create Your First Circle
              </GlassButton>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
