import React, { useState, useEffect } from 'react';
import { Users, Crown, Link2, Plus, X, TrendingUp, Clock, Award, UserMinus, Eye, BarChart3, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const CirclesView = ({ 
  user, 
  profile, 
  circles, 
  onCreateCircle,
  onJoinCircle,
  setError,
  supabase 
}) => {
  const [newCircleName, setNewCircleName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [circleMembers, setCircleMembers] = useState([]);
  const [circleAnalytics, setCircleAnalytics] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const createCircle = async () => {
    if (!newCircleName.trim()) {
      setError('Please enter a circle name');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (circles.length >= 3) {
      setError('Maximum 3 circles on free tier');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCreating(true);
    
    try {
      const result = await onCreateCircle(newCircleName);
      
      if (result.success) {
        setNewCircleName('');
        setError(`✨ ${result.message}`);
        setTimeout(() => setError(''), 5000);
      } else {
        setError(result.error);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error creating circle:', error);
      setError('Failed to create circle');
      setTimeout(() => setError(''), 3000);
    } finally {
      setCreating(false);
    }
  };

  const joinCircle = async () => {
    const code = joinCode.trim();
    
    if (!code) {
      setError('Please enter an invite code');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Invite code must be 6 digits');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (circles.length >= 3) {
      setError('Maximum 3 circles on free tier');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setJoining(true);
    
    try {
      const result = await onJoinCircle(code);
      
      if (result.success) {
        setJoinCode('');
        setError(`✨ ${result.message}`);
        setTimeout(() => setError(''), 3000);
      } else {
        setError(result.error);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error joining circle:', error);
      setError('Failed to join circle');
      setTimeout(() => setError(''), 3000);
    } finally {
      setJoining(false);
    }
  };

  const leaveCircle = async (circleId, circleName) => {
    if (!window.confirm(`Are you sure you want to leave "${circleName}"?`)) return;

    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('circle_id', circleId)
        .eq('user_id', user.id);

      if (error) throw error;

      onCirclesUpdate();
      setError(`Left "${circleName}"`);
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error leaving circle:', error);
      setError('Failed to leave circle');
      setTimeout(() => setError(''), 3000);
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
          joined_at
        `)
        .eq('circle_id', circleId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // Get profiles for avatars
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      const membersWithProfiles = data.map(member => ({
        ...member,
        ...profiles.find(p => p.id === member.user_id)
      }));

      setCircleMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error loading members:', error);
      setCircleMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadCircleAnalytics = async (circleId) => {
    setLoadingAnalytics(true);
    try {
      const { data: members } = await supabase
        .from('circle_members')
        .select('user_id')
        .eq('circle_id', circleId);

      if (!members || members.length === 0) {
        setCircleAnalytics(null);
        setLoadingAnalytics(false);
        return;
      }

      const memberIds = members.map(m => m.user_id);

      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .in('user_id', memberIds)
        .not('duration_seconds', 'is', null);

      const totalSessions = sessions?.length || 0;
      const totalTime = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
      const avgDuration = totalSessions > 0 ? Math.floor(totalTime / totalSessions) : 0;

      const { data: activeData } = await supabase
        .from('active_syncs')
        .select('user_id')
        .in('user_id', memberIds);

      const activeMembers = activeData?.length || 0;

      const userStats = memberIds.map(userId => ({
        userId,
        sessions: sessions?.filter(s => s.user_id === userId).length || 0
      }));

      const topPerformer = userStats.reduce((max, user) => 
        user.sessions > max.sessions ? user : max
      , { userId: null, sessions: 0 });

      const { data: topProfile } = topPerformer.userId ? await supabase
        .from('profiles')
        .select('username')
        .eq('id', topPerformer.userId)
        .single() : { data: null };

      setCircleAnalytics({
        totalSessions,
        totalTime,
        avgDuration,
        activeMembers,
        topPerformer: topProfile ? topProfile.username : 'N/A'
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setCircleAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleViewMembers = (circle) => {
    setSelectedCircle(circle);
    loadCircleMembers(circle.id);
    setShowMembersModal(true);
  };

  const handleViewAnalytics = (circle) => {
    setSelectedCircle(circle);
    loadCircleAnalytics(circle.id);
    setShowAnalyticsModal(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-gray-800 z-10">
        <div className="px-6 py-5">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Circles
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {circles.length}/3 circles • Max 6 members each
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Create Circle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden border border-gray-800 rounded-3xl p-6 bg-gradient-to-br from-gray-900 to-black"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Plus size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Create New Circle</h3>
                <p className="text-gray-400 text-sm">Start your own sync group</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <input 
                type="text" 
                value={newCircleName} 
                onChange={(e) => setNewCircleName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createCircle()}
                placeholder="Enter circle name..."
                disabled={circles.length >= 3 || creating}
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-gray-500"
              />
              <button
                onClick={createCircle}
                disabled={!newCircleName.trim() || circles.length >= 3 || creating}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 rounded-xl font-semibold transition disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Create Circle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Join Circle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden border border-gray-800 rounded-3xl p-6 bg-gradient-to-br from-gray-900 to-black"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Link2 size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Join a Circle</h3>
                <p className="text-gray-400 text-sm">Enter a 6-digit invite code</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <input 
                type="text" 
                value={joinCode} 
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setJoinCode(value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && joinCircle()}
                placeholder="Enter 6-digit code..."
                disabled={circles.length >= 3 || joining}
                maxLength={6}
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-gray-500 text-center text-2xl font-mono tracking-widest"
              />
              <button
                onClick={joinCircle}
                disabled={joinCode.length !== 6 || circles.length >= 3 || joining}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-800 rounded-xl font-semibold transition disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {joining ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Join Circle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Your Circles */}
        {circles.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
              Your Circles ({circles.length})
            </h3>
            
            <div className="space-y-4">
              {circles.map((circle, index) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden border border-gray-800 rounded-3xl p-6 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition-all group"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Users size={28} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-bold">{circle.name}</h3>
                            {circle.created_by === user.id && (
                              <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center space-x-1">
                                <Crown size={12} className="text-yellow-500" />
                                <span className="text-yellow-500 text-xs font-semibold">Owner</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            Created {new Date(circle.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Invite Code */}
                    <div className="mb-6 p-4 bg-black/50 border border-gray-800 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Invite Code</p>
                          <code className="text-2xl font-mono font-bold tracking-wider bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {circle.invite_code}
                          </code>
                        </div>
                        <button 
                          onClick={() => copyInviteCode(circle.invite_code)}
                          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition flex items-center space-x-2 group"
                        >
                          {copiedCode === circle.invite_code ? (
                            <>
                              <Check size={16} className="text-green-500" />
                              <span className="text-green-500 text-sm font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={16} className="text-gray-400 group-hover:text-white transition" />
                              <span className="text-gray-400 group-hover:text-white transition text-sm font-medium">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleViewMembers(circle)}
                        className="px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition flex items-center justify-center space-x-2 text-sm font-medium"
                      >
                        <Eye size={16} />
                        <span>Members</span>
                      </button>
                      <button
                        onClick={() => handleViewAnalytics(circle)}
                        className="px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition flex items-center justify-center space-x-2 text-sm font-medium"
                      >
                        <BarChart3 size={16} />
                        <span>Stats</span>
                      </button>
                      <button
                        onClick={() => leaveCircle(circle.id, circle.name)}
                        className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition flex items-center justify-center space-x-2 text-sm font-medium"
                      >
                        <UserMinus size={16} />
                        <span>Leave</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {circles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="border border-gray-800 rounded-3xl p-16 text-center bg-gradient-to-br from-gray-900 to-black"
          >
            <div className="h-24 w-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users size={48} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No circles yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Create your first circle or join one using an invite code to start syncing with friends
            </p>
          </motion.div>
        )}
      </div>

      {/* Members Modal */}
      <AnimatePresence>
        {showMembersModal && selectedCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMembersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{selectedCircle.name}</h3>
                  <p className="text-gray-400 text-sm">Circle Members</p>
                </div>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="h-10 w-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              {loadingMembers ? (
                <div className="py-12 text-center">
                  <div className="h-8 w-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading members...</p>
                </div>
              ) : circleMembers.length > 0 ? (
                <div className="space-y-3">
                  {circleMembers.map((member, index) => (
                    <motion.div
                      key={member.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl flex items-center space-x-4"
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.username}
                          className="h-12 w-12 rounded-xl object-cover border-2 border-gray-700"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {member.username?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{member.username || 'Unknown'}</p>
                        <p className="text-gray-400 text-sm">
                          Joined {new Date(member.joined_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      {member.user_id === selectedCircle.created_by && (
                        <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <Crown size={14} className="text-yellow-500" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No members found</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && selectedCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAnalyticsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{selectedCircle.name}</h3>
                  <p className="text-gray-400 text-sm">Circle Analytics</p>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="h-10 w-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="py-12 text-center">
                  <div className="h-8 w-8 border-2 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading analytics...</p>
                </div>
              ) : circleAnalytics ? (
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <TrendingUp size={20} className="text-blue-400" />
                      <span className="text-gray-400 text-sm">Total Sessions</span>
                    </div>
                    <p className="text-3xl font-bold">{circleAnalytics.totalSessions}</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock size={20} className="text-purple-400" />
                      <span className="text-gray-400 text-sm">Total Time</span>
                    </div>
                    <p className="text-3xl font-bold">{formatDuration(circleAnalytics.totalTime)}</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <BarChart3 size={20} className="text-green-400" />
                      <span className="text-gray-400 text-sm">Avg Duration</span>
                    </div>
                    <p className="text-3xl font-bold">{formatDuration(circleAnalytics.avgDuration)}</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Award size={20} className="text-yellow-400" />
                      <span className="text-gray-400 text-sm">Top Performer</span>
                    </div>
                    <p className="text-xl font-bold truncate">{circleAnalytics.topPerformer}</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users size={20} className="text-red-400" />
                      <span className="text-gray-400 text-sm">Active Now</span>
                    </div>
                    <p className="text-3xl font-bold">{circleAnalytics.activeMembers}</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No analytics available</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CirclesView;
