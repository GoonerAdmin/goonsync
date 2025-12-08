import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Square, Clock, TrendingUp, Users, Trophy, 
  Activity, Zap, Calendar, Target
} from 'lucide-react';
import Button from './Button';

const Dashboard = ({ 
  user, 
  profile, 
  isSyncing, 
  elapsedTime, 
  onStartSync, 
  onStopSync,
  circles,
  sessions,
  activeUsers,
  analytics,
  supabase,
  children 
}) => {
  // Local state for real data
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
      
      // Refresh every 10 seconds
      const interval = setInterval(loadDashboardData, 10000);
      return () => clearInterval(interval);
    }
  }, [user, supabase]);

  const loadDashboardData = async () => {
    if (!user || !supabase) return;

    try {
      // Load user's sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;

      setUserSessions(sessionsData || []);

      // Calculate stats from sessions
      if (sessionsData && sessionsData.length > 0) {
        const totalSessions = sessionsData.length;
        const totalTime = sessionsData.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
        const avgDuration = Math.floor(totalTime / totalSessions);
        const longestSession = Math.max(...sessionsData.map(s => s.duration_seconds || 0));

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

      // Load currently active users (in user's circles)
      if (circles && circles.length > 0) {
        const circleIds = circles.map(c => c.id);
        
        const { data: activeData, error: activeError } = await supabase
          .from('active_syncs')
          .select(`
            user_id,
            started_at,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .in('circle_id', circleIds)
          .neq('user_id', user.id); // Exclude current user

        if (activeError) throw activeError;

        // Format active members
        const formatted = activeData?.map(a => ({
          id: a.user_id,
          username: a.profiles?.username || 'Unknown',
          avatar_url: a.profiles?.avatar_url,
          started_at: a.started_at
        })) || [];

        setActiveMembers(formatted);
      } else {
        setActiveMembers([]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen pb-20 bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-sm text-gray-400">Welcome back, {profile?.username}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-full">
              <div className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
              <span className="text-xs text-gray-400">
                {isSyncing ? 'Syncing' : 'Idle'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* XP Bar (passed as children) */}
        {children}

        {/* Session Control Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-800 rounded-2xl p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">
                {isSyncing ? 'Current Session' : 'Ready to Start'}
              </p>
              <p className="text-4xl font-bold text-white">
                {isSyncing ? formatElapsedTime(elapsedTime) : '00:00:00'}
              </p>
            </div>
            <div className={`
              h-20 w-20 rounded-full flex items-center justify-center
              ${isSyncing 
                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }
            `}>
              {isSyncing ? (
                <Square size={32} className="text-white" />
              ) : (
                <Play size={32} className="text-white ml-1" />
              )}
            </div>
          </div>

          <Button
            onClick={isSyncing ? onStopSync : onStartSync}
            variant={isSyncing ? 'danger' : 'primary'}
            className="w-full py-4 text-lg font-semibold"
          >
            {isSyncing ? 'Stop Session' : 'Start Session'}
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <TrendingUp size={20} className="text-blue-500" />
            <span>Your Stats</span>
          </h3>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-800 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30 hover:bg-gray-900/50 transition">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock size={16} className="text-blue-400" />
                  <p className="text-gray-400 text-sm">Total Sessions</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {userStats.totalSessions}
                </p>
              </div>

              <div className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30 hover:bg-gray-900/50 transition">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp size={16} className="text-purple-400" />
                  <p className="text-gray-400 text-sm">Total Time</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatTime(userStats.totalTime)}
                </p>
              </div>

              <div className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30 hover:bg-gray-900/50 transition">
                <div className="flex items-center space-x-2 mb-2">
                  <Target size={16} className="text-green-400" />
                  <p className="text-gray-400 text-sm">Avg Duration</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatTime(userStats.avgDuration)}
                </p>
              </div>

              <div className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30 hover:bg-gray-900/50 transition">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy size={16} className="text-yellow-400" />
                  <p className="text-gray-400 text-sm">Longest</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatTime(userStats.longestSession)}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Active Now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <Activity size={20} className="text-green-500" />
            <span>Active Now</span>
            {activeMembers.length > 0 && (
              <span className="text-sm text-gray-400">({activeMembers.length})</span>
            )}
          </h3>

          {activeMembers.length === 0 ? (
            <div className="border border-gray-800 rounded-2xl p-8 text-center bg-gray-900/30">
              <Users size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm">No one in your circles is active right now</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="border border-gray-800 rounded-xl p-4 bg-gray-900/30 flex items-center justify-between hover:bg-gray-900/50 transition"
                >
                  <div className="flex items-center space-x-3">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.username}
                        className="h-10 w-10 rounded-full object-cover border border-gray-700"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{member.username}</p>
                      <p className="text-xs text-gray-400">
                        Started {getTimeSince(member.started_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-400">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <Calendar size={20} className="text-purple-500" />
            <span>Recent Sessions</span>
          </h3>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="border border-gray-800 rounded-xl p-4 bg-gray-900/30 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
                  <div className="h-6 bg-gray-800 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : userSessions.length === 0 ? (
            <div className="border border-gray-800 rounded-2xl p-8 text-center bg-gray-900/30">
              <Clock size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm">No sessions yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {userSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-800 rounded-xl p-4 bg-gray-900/30 hover:bg-gray-900/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {formatDate(session.created_at)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {session.circle_id ? 'In Circle' : 'Solo Session'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-white">
                        {formatTime(session.duration_seconds)}
                      </p>
                      <p className="text-xs text-gray-400">Duration</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
