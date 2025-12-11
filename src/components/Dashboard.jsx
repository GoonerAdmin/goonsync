import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Square, Clock, TrendingUp, Users, Trophy, 
  Activity, Zap, Calendar, Target, Award, BarChart3,
  Timer, Flame
} from 'lucide-react';

const Dashboard = ({ 
  user, 
  profile, 
  isSyncing, 
  elapsedTime, 
  onStartSync, 
  onStopSync,
  circles,
  supabase
}) => {
  const [userSessions, setUserSessions] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    totalTime: 0,
    avgDuration: 0,
    longestSession: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && supabase) {
      loadDashboardData();
      
      // Refresh dashboard data every 10 seconds
      const dashboardInterval = setInterval(loadDashboardData, 10000);
      
      // Refresh active users every 3 seconds (faster for real-time feel)
      const activeUsersInterval = setInterval(refreshActiveUsers, 3000);
      
      return () => {
        clearInterval(dashboardInterval);
        clearInterval(activeUsersInterval);
      };
    }
  }, [user, supabase, circles]);

  const loadDashboardData = async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);

      // Load ALL user's sessions for stats
      const { data: allSessionsData, error: allSessionsError } = await supabase
        .from('sessions')
        .select('duration_seconds')
        .eq('user_id', user.id);

      if (allSessionsError) throw allSessionsError;

      // Load recent 10 sessions for display
      const { data: recentSessionsData, error: recentError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      // Calculate stats from ALL sessions
      if (allSessionsData && allSessionsData.length > 0) {
        const completedSessions = allSessionsData.filter(s => s.duration_seconds && s.duration_seconds >= 5);
        
        if (completedSessions.length > 0) {
          const totalSessions = completedSessions.length;
          const totalTime = completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
          const avgDuration = Math.floor(totalTime / totalSessions);
          const longestSession = Math.max(...completedSessions.map(s => s.duration_seconds || 0));

          setUserStats({
            totalSessions,
            totalTime,
            avgDuration,
            longestSession
          });
        } else {
          setUserStats({
            totalSessions: 0,
            totalTime: 0,
            avgDuration: 0,
            longestSession: 0
          });
        }
      }

      // Set recent sessions for display
      if (recentSessionsData) {
        setUserSessions(recentSessionsData.filter(s => s.duration_seconds && s.duration_seconds >= 5));
      }

      // Load active users
      await refreshActiveUsers();

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveUsers = async () => {
    if (!circles || circles.length === 0) {
      setActiveMembers([]);
      return;
    }

    try {
      const circleIds = circles.map(c => c.id);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: activeData } = await supabase
        .from('active_syncs')
        .select('user_id, created_at, circle_id')
        .in('circle_id', circleIds)
        .neq('user_id', user.id)
        .gte('created_at', fiveMinutesAgo);

      if (activeData && activeData.length > 0) {
        const activeUserIds = [...new Set(activeData.map(a => a.user_id))];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', activeUserIds);

        if (profilesData) {
          const combined = activeData.map(active => ({
            ...active,
            ...profilesData.find(p => p.id === active.user_id)
          }));
          
          // Remove duplicates
          const uniqueMembers = combined.filter((member, index, self) =>
            index === self.findIndex(m => m.user_id === member.user_id)
          );
          
          setActiveMembers(uniqueMembers);
        }
      } else {
        setActiveMembers([]);
      }
    } catch (error) {
      console.error('Error loading active users:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-gray-800 z-10">
        <div className="px-6 py-5">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, {profile?.username || 'User'}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Sync Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden border border-gray-800 rounded-3xl p-8 bg-gradient-to-br from-gray-900 to-black"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-1">Current Session</h3>
                <p className="text-gray-400">
                  {isSyncing ? 'In progress...' : 'Ready to sync'}
                </p>
              </div>
              {isSyncing && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 font-semibold text-sm">LIVE</span>
                </div>
              )}
            </div>

            {/* Timer Display */}
            <div className="mb-6">
              <div className="inline-flex items-center space-x-3 px-6 py-4 bg-black/50 border border-gray-800 rounded-2xl">
                <Clock className={isSyncing ? "text-blue-400 animate-pulse" : "text-gray-600"} size={28} />
                <span className={`text-5xl font-mono font-bold ${isSyncing ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' : 'text-gray-600'}`}>
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>

            {/* Start/Stop Button */}
            <button
              onClick={isSyncing ? onStopSync : onStartSync}
              className={`w-full px-6 py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center space-x-3 ${
                isSyncing
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {isSyncing ? (
                <>
                  <Square size={24} fill="currentColor" />
                  <span>End Session</span>
                </>
              ) : (
                <>
                  <Play size={24} fill="currentColor" />
                  <span>Start Session</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-3xl font-bold">{userStats.totalSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Time</p>
                <p className="text-3xl font-bold">{formatDuration(userStats.totalTime)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg Duration</p>
                <p className="text-3xl font-bold">{formatDuration(userStats.avgDuration)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-12 w-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Trophy size={24} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Longest</p>
                <p className="text-3xl font-bold">{formatDuration(userStats.longestSession)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active Users */}
        {activeMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border border-gray-800 rounded-3xl p-6 bg-gradient-to-br from-gray-900 to-black"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Activity size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Active Now</h3>
                <p className="text-gray-400 text-sm">{activeMembers.length} {activeMembers.length === 1 ? 'member' : 'members'} syncing</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeMembers.map((member, index) => (
                <motion.div
                  key={member.user_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl flex items-center space-x-3"
                >
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.username}
                      className="h-10 w-10 rounded-lg object-cover border-2 border-green-500"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center border-2 border-green-500">
                      <span className="text-white font-bold">
                        {member.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{member.username || 'Unknown'}</p>
                    <div className="flex items-center space-x-1">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-green-400 text-xs">Online</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Sessions */}
        {userSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border border-gray-800 rounded-3xl p-6 bg-gradient-to-br from-gray-900 to-black"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Recent Sessions</h3>
                <p className="text-gray-400 text-sm">Your last {userSessions.length} sessions</p>
              </div>
            </div>

            <div className="space-y-3">
              {userSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl flex items-center justify-between hover:bg-gray-800 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Timer size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {formatDuration(session.duration_seconds)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(session.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {session.xp_earned && (
                    <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <span className="text-yellow-400 font-semibold text-sm">+{session.xp_earned} XP</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && userSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="border border-gray-800 rounded-3xl p-16 text-center bg-gradient-to-br from-gray-900 to-black"
          >
            <div className="h-24 w-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap size={48} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No sessions yet</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Start your first session to begin tracking your progress
            </p>
            <button
              onClick={onStartSync}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition flex items-center space-x-2 mx-auto"
            >
              <Play size={20} fill="currentColor" />
              <span>Start First Session</span>
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="h-12 w-12 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
