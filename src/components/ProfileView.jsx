import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, LogOut, Camera, Save, Trophy, Clock, TrendingUp, 
  Award, Target, Zap, Calendar, Activity
} from 'lucide-react';
import Button from './Button';

const ProfileView = ({ user, profile, onLogout, supabase, onProfileUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [newAvatarUrl, setNewAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Stats state
  const [userStats, setUserStats] = useState(null);
  const [userXP, setUserXP] = useState({ total_xp: 0, current_level: 1 });
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      loadUserStats();
    }
  }, [user, profile]);

  const loadUserStats = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Try to load from user_stats table first
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // If user_stats exists, use it
      if (stats && !statsError) {
        setUserStats(stats);
        setUserXP({
          total_xp: stats.total_xp || 0,
          current_level: stats.current_level || 1
        });
      } else {
        // FALLBACK: Calculate from sessions if user_stats doesn't exist
        console.log('user_stats not found, calculating from sessions...');
        
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('duration_seconds')
          .eq('user_id', user.id);

        if (sessionsError) throw sessionsError;

        if (sessions && sessions.length > 0) {
          const totalSessions = sessions.length;
          const totalTime = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
          const longestSession = Math.max(...sessions.map(s => s.duration_seconds || 0));

          setUserStats({
            total_sessions: totalSessions,
            total_time: totalTime,
            achievements_unlocked: 0,
            longest_session: longestSession,
            total_xp: 0,
            current_level: 1
          });
        } else {
          // No sessions at all
          setUserStats({
            total_sessions: 0,
            total_time: 0,
            achievements_unlocked: 0,
            longest_session: 0,
            total_xp: 0,
            current_level: 1
          });
        }

        setUserXP({
          total_xp: 0,
          current_level: 1
        });
      }

      // Load recent achievements (last 5)
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(5);
      
      if (!achievementsError && achievements) {
        setRecentAchievements(achievements);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default empty stats on error
      setUserStats({
        total_sessions: 0,
        total_time: 0,
        achievements_unlocked: 0,
        longest_session: 0,
        total_xp: 0,
        current_level: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: newUsername.trim(),
          avatar_url: newAvatarUrl.trim() || null
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setEditing(false);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewUsername(profile?.username || '');
    setNewAvatarUrl(profile?.avatar_url || '');
    setEditing(false);
    setError('');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format time duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!profile) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center space-x-2 text-white">
            <User size={24} className="text-blue-500" />
            <span>Profile</span>
          </h2>
          <Button
            onClick={onLogout}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-800 rounded-2xl p-6 bg-gray-900/30"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-700"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                )}
                {editing && (
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition">
                    <Camera size={16} className="text-white" />
                  </div>
                )}
              </div>

              {/* Username */}
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Username"
                  />
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-white">{profile.username}</h3>
                    <p className="text-sm text-gray-400">
                      Member since {formatDate(profile.created_at)}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Edit/Save Buttons */}
            <div className="flex items-center space-x-2">
              {editing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    size="sm"
                    disabled={saving}
                  >
                    <Save size={16} className="mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  variant="secondary"
                  size="sm"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Avatar URL Input */}
          {editing && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Avatar URL (optional)
              </label>
              <input
                type="url"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </motion.div>

        {/* XP & Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-gray-800 rounded-2xl p-6 bg-gray-900/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Zap size={20} className="text-yellow-500" />
              <span>Level & XP</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-black/50 rounded-xl">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {userXP.current_level}
              </div>
              <div className="text-sm text-gray-400">Current Level</div>
            </div>

            <div className="text-center p-4 bg-black/50 rounded-xl">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {userXP.total_xp.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total XP</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        {!loading && userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-gray-800 rounded-2xl p-6 bg-gray-900/30"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Activity size={20} className="text-green-500" />
              <span>Statistics</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-800 rounded-xl p-4 bg-black/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock size={16} className="text-blue-400" />
                  <span className="text-sm text-gray-400">Total Sessions</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {userStats.total_sessions || 0}
                </div>
              </div>

              <div className="border border-gray-800 rounded-xl p-4 bg-black/50">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp size={16} className="text-purple-400" />
                  <span className="text-sm text-gray-400">Total Time</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatDuration(userStats.total_time || 0)}
                </div>
              </div>

              <div className="border border-gray-800 rounded-xl p-4 bg-black/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy size={16} className="text-yellow-400" />
                  <span className="text-sm text-gray-400">Achievements</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {userStats.achievements_unlocked || 0}
                </div>
              </div>

              <div className="border border-gray-800 rounded-xl p-4 bg-black/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Target size={16} className="text-green-400" />
                  <span className="text-sm text-gray-400">Longest Session</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatDuration(userStats.longest_session || 0)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border border-gray-800 rounded-2xl p-6 bg-gray-900/30"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Award size={20} className="text-yellow-500" />
              <span>Recent Achievements</span>
            </h3>

            <div className="space-y-3">
              {recentAchievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Trophy size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        Achievement #{achievement.achievement_id}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(achievement.unlocked_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-gray-800 rounded-2xl p-6 bg-gray-900/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Calendar size={20} className="text-blue-500" />
            <span>Account Information</span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">User ID</span>
              <span className="text-white font-mono text-sm">
                {user.id.substring(0, 8)}...
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Email</span>
              <span className="text-white text-sm">{user.email}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Member Since</span>
              <span className="text-white text-sm">
                {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Logout Button (Mobile) */}
        <Button
          onClick={onLogout}
          variant="danger"
          className="w-full flex items-center justify-center space-x-2"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileView;
