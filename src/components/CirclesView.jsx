import React, { useState, useEffect } from 'react';
import { Users, Plus, Link2, Crown, LogOut as LeaveIcon, TrendingUp, Clock, Award, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const CirclesView = ({ user, profile, circles, onCreateCircle, onJoinCircle, onLeaveCircle, supabase, onUpdate }) => {
  const [newCircleName, setNewCircleName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showMembersModal, setShowMembersModal] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
  const [members, setMembers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState('');

  const handleCreateCircle = async () => {
    if (!newCircleName.trim()) return;
    const result = await onCreateCircle(newCircleName);
    if (result.success) {
      setNewCircleName('');
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleJoinCircle = async () => {
    if (!joinCode.trim()) return;
    const result = await onJoinCircle(joinCode);
    if (result.success) {
      setJoinCode('');
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleLeaveCircle = async (circleId) => {
    const result = await onLeaveCircle(circleId);
    if (result.success) {
      setShowLeaveConfirm(null);
      setError('');
    } else {
      setError(result.error);
    }
  };

  const loadCircleMembers = async (circleId) => {
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          user_id,
          username,
          joined_at,
          profiles:user_id (
            avatar_url
          )
        `)
        .eq('circle_id', circleId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
      setError('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadCircleAnalytics = async (circleId) => {
    setLoadingAnalytics(true);
    try {
      // Get all sessions for this circle
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('circle_id', circleId)
        .not('duration_seconds', 'is', null);

      if (sessionsError) throw sessionsError;

      // Calculate analytics
      const totalSessions = sessions?.length || 0;
      const totalDuration = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
      const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
      const longestSession = totalSessions > 0 ? Math.max(...sessions.map(s => s.duration_seconds)) : 0;

      // Get unique users
      const uniqueUsers = new Set(sessions?.map(s => s.user_id));
      const activeMembers = uniqueUsers.size;

      // Get user's stats in this circle
      const userSessions = sessions?.filter(s => s.user_id === user.id) || [];
      const userTotalSessions = userSessions.length;
      const userTotalDuration = userSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      const userAvgDuration = userTotalSessions > 0 ? Math.round(userTotalDuration / userTotalSessions) : 0;

      // Get this week's activity
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekSessions = sessions?.filter(s => new Date(s.start_time) >= weekAgo).length || 0;

      // Calculate top performers
      const userStats = {};
      sessions?.forEach(s => {
        if (!userStats[s.user_id]) {
          userStats[s.user_id] = {
            username: s.username,
            totalSessions: 0,
            totalDuration: 0,
            avgDuration: 0
          };
        }
        userStats[s.user_id].totalSessions += 1;
        userStats[s.user_id].totalDuration += s.duration_seconds;
      });

      // Calculate averages and sort
      const topPerformers = Object.values(userStats)
        .map(u => ({
          ...u,
          avgDuration: Math.round(u.totalDuration / u.totalSessions)
        }))
        .sort((a, b) => b.totalDuration - a.totalDuration)
        .slice(0, 5);

      setAnalytics({
        totalSessions,
        totalDuration,
        avgDuration,
        longestSession,
        activeMembers,
        thisWeekSessions,
        userStats: {
          totalSessions: userTotalSessions,
          totalDuration: userTotalDuration,
          avgDuration: userAvgDuration
        },
        topPerformers
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const openMembersModal = async (circle) => {
    setShowMembersModal(circle);
    await loadCircleMembers(circle.id);
  };

  const openAnalyticsModal = async (circle) => {
    setShowAnalyticsModal(circle);
    await loadCircleAnalytics(circle.id);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-x-border z-10">
        <div className="px-4 py-4">
          <h2 className="text-xl font-bold">Circles</h2>
          <p className="text-x-gray text-sm">
            {circles.length}/3 circles • Max 6 members each
          </p>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 max-w-md"
          >
            <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-4">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4">
        {/* Current Circles */}
        {circles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-x-gray uppercase tracking-wider px-2">Your Circles</h3>
            {circles.map(circle => (
              <motion.div
                key={circle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-x-border rounded-2xl p-5 hover:bg-x-hover transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold">{circle.name}</h3>
                        {circle.created_by === user.id && (
                          <div className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-xs font-semibold">
                            Owner
                          </div>
                        )}
                      </div>
                      <p className="text-x-gray text-sm">Created {formatDate(circle.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Invite Code */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-x-gray">Code:</span>
                    <code className="px-3 py-1 bg-black border border-x-border rounded-lg font-mono font-semibold">
                      {circle.invite_code}
                    </code>
                  </div>
                  <button 
                    onClick={() => { 
                      navigator.clipboard.writeText(circle.invite_code); 
                      setError('Invite code copied!');
                      setTimeout(() => setError(''), 2000);
                    }} 
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-x-gray hover:text-x-blue border border-x-border rounded-lg hover:border-x-blue transition"
                  >
                    <Link2 size={14} />
                    <span>Copy</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openMembersModal(circle)}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-black border border-x-border rounded-lg hover:border-x-blue hover:text-x-blue transition text-sm"
                  >
                    <Eye size={16} />
                    <span>Members</span>
                  </button>

                  <button
                    onClick={() => openAnalyticsModal(circle)}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-black border border-x-border rounded-lg hover:border-green-500 hover:text-green-500 transition text-sm"
                  >
                    <TrendingUp size={16} />
                    <span>Analytics</span>
                  </button>

                  <button
                    onClick={() => setShowLeaveConfirm(circle)}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-black border border-x-border rounded-lg hover:border-red-500 hover:text-red-500 transition text-sm"
                  >
                    <LeaveIcon size={16} />
                    <span>Leave</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {circles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-x-border rounded-2xl p-12 text-center"
          >
            <div className="h-20 w-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={36} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No circles yet</h3>
            <p className="text-x-gray mb-6">Create your first circle or join one with an invite code</p>
          </motion.div>
        )}

        {/* Create Circle */}
        <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
          <div className="flex items-center space-x-2 mb-4">
            <Plus size={20} className="text-x-blue" />
            <h3 className="font-bold text-lg">Create New Circle</h3>
          </div>
          <input 
            type="text" 
            placeholder="Enter circle name..." 
            value={newCircleName} 
            onChange={(e) => setNewCircleName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateCircle()}
            className="w-full px-4 py-3 bg-black border border-x-border rounded-xl focus:outline-none focus:border-x-blue mb-3 transition placeholder:text-gray-600" 
          />
          <Button 
            onClick={handleCreateCircle} 
            disabled={circles.length >= 3 || !newCircleName.trim()}
            variant="primary"
            className="w-full"
            icon={Plus}
          >
            {circles.length >= 3 ? 'Max Circles Reached' : 'Create Circle'}
          </Button>
          {circles.length >= 3 && (
            <p className="text-yellow-500 text-sm mt-3 text-center">
              Free tier: 3 circles maximum
            </p>
          )}
        </div>

        {/* Join Circle */}
        <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
          <div className="flex items-center space-x-2 mb-4">
            <Link2 size={20} className="text-x-blue" />
            <h3 className="font-bold text-lg">Join Circle</h3>
          </div>
          <input 
            type="text" 
            placeholder="Enter invite code..." 
            value={joinCode} 
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinCircle()}
            className="w-full px-4 py-3 bg-black border border-x-border rounded-xl focus:outline-none focus:border-x-blue mb-3 transition font-mono uppercase placeholder:text-gray-600" 
          />
          <Button 
            onClick={handleJoinCircle} 
            disabled={circles.length >= 3 || !joinCode.trim()}
            variant="secondary"
            className="w-full"
          >
            {circles.length >= 3 ? 'Max Circles Reached' : 'Join Circle'}
          </Button>
        </div>
      </div>

      {/* Members Modal */}
      <AnimatePresence>
        {showMembersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMembersModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-3xl p-6 max-w-md w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{showMembersModal.name} Members</h3>
                <button onClick={() => setShowMembersModal(null)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-x-blue border-t-transparent mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member, i) => (
                    <motion.div
                      key={member.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center space-x-3 p-3 bg-black rounded-xl border border-x-border"
                    >
                      {member.profiles?.avatar_url ? (
                        <img 
                          src={member.profiles.avatar_url} 
                          alt={member.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {member.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold flex items-center space-x-2">
                          <span>{member.username}</span>
                          {member.user_id === user.id && (
                            <span className="text-xs px-2 py-0.5 bg-x-blue/20 text-x-blue rounded">You</span>
                          )}
                          {showMembersModal.created_by === member.user_id && (
                            <Crown size={14} className="text-yellow-500" />
                          )}
                        </p>
                        <p className="text-xs text-x-gray">Joined {formatDate(member.joined_at)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAnalyticsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-3xl p-6 max-w-md w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{showAnalyticsModal.name} Analytics</h3>
                <button onClick={() => setShowAnalyticsModal(null)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-x-blue border-t-transparent mx-auto"></div>
                </div>
              ) : analytics ? (
                <div className="space-y-4">
                  {/* Circle Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black rounded-xl p-4 border border-x-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users size={16} className="text-blue-500" />
                        <p className="text-xs text-x-gray">Total Sessions</p>
                      </div>
                      <p className="text-2xl font-bold">{analytics.totalSessions}</p>
                    </div>

                    <div className="bg-black rounded-xl p-4 border border-x-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock size={16} className="text-purple-500" />
                        <p className="text-xs text-x-gray">Avg Duration</p>
                      </div>
                      <p className="text-2xl font-bold">{formatDuration(analytics.avgDuration)}</p>
                    </div>

                    <div className="bg-black rounded-xl p-4 border border-x-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award size={16} className="text-yellow-500" />
                        <p className="text-xs text-x-gray">Active Members</p>
                      </div>
                      <p className="text-2xl font-bold">{analytics.activeMembers}</p>
                    </div>

                    <div className="bg-black rounded-xl p-4 border border-x-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp size={16} className="text-green-500" />
                        <p className="text-xs text-x-gray">This Week</p>
                      </div>
                      <p className="text-2xl font-bold">{analytics.thisWeekSessions}</p>
                    </div>
                  </div>

                  {/* Your Stats in Circle */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
                    <h4 className="font-bold mb-3 text-sm">Your Stats in This Circle</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold">{analytics.userStats.totalSessions}</p>
                        <p className="text-xs text-x-gray">Sessions</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{formatDuration(analytics.userStats.totalDuration)}</p>
                        <p className="text-xs text-x-gray">Total Time</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{formatDuration(analytics.userStats.avgDuration)}</p>
                        <p className="text-xs text-x-gray">Avg Duration</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Performers */}
                  {analytics.topPerformers.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3 text-sm">Top Performers</h4>
                      <div className="space-y-2">
                        {analytics.topPerformers.map((performer, i) => (
                          <div 
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-xl ${
                              performer.username === profile?.username 
                                ? 'bg-x-blue/10 border border-x-blue' 
                                : 'bg-black border border-x-border'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-bold w-6">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                              </span>
                              <div>
                                <p className="font-semibold text-sm">{performer.username}</p>
                                <p className="text-xs text-x-gray">{performer.totalSessions} sessions</p>
                              </div>
                            </div>
                            <p className="font-bold text-sm">{formatDuration(performer.totalDuration)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-x-gray py-8">No analytics available</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLeaveConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-3xl p-6 max-w-md w-full border border-red-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LeaveIcon size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Leave Circle?</h3>
                <p className="text-x-gray mb-6">
                  Are you sure you want to leave <strong>{showLeaveConfirm.name}</strong>? 
                  {showLeaveConfirm.created_by === user.id && (
                    <span className="block mt-2 text-yellow-500 text-sm">
                      Warning: You're the owner. The circle will continue without you.
                    </span>
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLeaveConfirm(null)}
                    className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleLeaveCircle(showLeaveConfirm.id)}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold"
                  >
                    Leave Circle
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CirclesView;
