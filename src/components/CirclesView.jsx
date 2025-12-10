import React, { useState, useEffect } from 'react';
import { Users, Crown, Link2, Plus, X, TrendingUp, Clock, Award, UserMinus, Eye, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import Button from './Button';

const CirclesView = ({ user, profile, circles, onCirclesUpdate, setError }) => {
  const [newCircleName, setNewCircleName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [circleMembers, setCircleMembers] = useState([]);
  const [circleAnalytics, setCircleAnalytics] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const createCircle = async () => {
    if (!newCircleName.trim()) return;
    const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const { data: circleData, error } = await supabase
        .from('circles')
        .insert([{ name: newCircleName, invite_code: inviteCode, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      if (circleData) {
        await supabase.from('circle_members').insert([{ 
          circle_id: circleData.id, 
          user_id: user.id, 
          username: profile.username 
        }]);
        
        setNewCircleName('');
        onCirclesUpdate();
        setError(`Circle created! Invite code: ${inviteCode}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error creating circle:', error);
      setError('Failed to create circle');
      setTimeout(() => setError(''), 3000);
    }
  };

  const joinCircle = async () => {
    if (!joinCode.trim()) return;
    
    try {
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('invite_code', joinCode.toUpperCase())
        .single();

      if (circleError || !circleData) {
        setError('Invalid invite code!');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const { data: members } = await supabase
        .from('circle_members')
        .select('*')
        .eq('circle_id', circleData.id);

      if (members && members.length >= 6) {
        setError('Circle is full (max 6 members)');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const { data: existing } = await supabase
        .from('circle_members')
        .select('*')
        .eq('circle_id', circleData.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        setError('You\'re already in this circle!');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (circles.length >= 3) {
        setError('Maximum 3 circles on free tier');
        setTimeout(() => setError(''), 3000);
        return;
      }

      await supabase.from('circle_members').insert([{ 
        circle_id: circleData.id, 
        user_id: user.id, 
        username: profile.username 
      }]);

      setJoinCode('');
      onCirclesUpdate();
      setError(`Joined ${circleData.name}!`);
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error joining circle:', error);
      setError('Failed to join circle');
      setTimeout(() => setError(''), 3000);
    }
  };

  const leaveCircle = async (circleId, circleName) => {
    if (!confirm(`Are you sure you want to leave "${circleName}"?`)) return;

    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('circle_id', circleId)
        .eq('user_id', user.id);

      if (error) throw error;

      onCirclesUpdate();
      setError(`Left ${circleName}`);
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
        .select('user_id, username, joined_at')
        .eq('circle_id', circleId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setCircleMembers(data || []);
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
      // Get all sessions for this circle
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('circle_id', circleId)
        .not('duration_seconds', 'is', null);

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        setCircleAnalytics({
          totalSessions: 0,
          totalTime: 0,
          avgDuration: 0,
          activeMembers: 0,
          topPerformer: null
        });
        return;
      }

      // Calculate stats
      const totalSessions = sessions.length;
      const totalTime = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
      const avgDuration = Math.floor(totalTime / totalSessions);

      // Get unique active members
      const activeMembers = new Set(sessions.map(s => s.user_id)).size;

      // Calculate top performer
      const userStats = {};
      sessions.forEach(s => {
        if (!userStats[s.user_id]) {
          userStats[s.user_id] = { 
            username: s.username, 
            totalTime: 0, 
            sessions: 0 
          };
        }
        userStats[s.user_id].totalTime += s.duration_seconds;
        userStats[s.user_id].sessions += 1;
      });

      const topPerformer = Object.values(userStats).sort((a, b) => b.totalTime - a.totalTime)[0];

      setCircleAnalytics({
        totalSessions,
        totalTime,
        avgDuration,
        activeMembers,
        topPerformer
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
    <div className="min-h-screen">
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-x-border z-10">
        <div className="px-4 py-4">
          <h2 className="text-xl font-bold">Circles</h2>
          <p className="text-x-gray text-sm">
            {circles.length}/3 circles • Max 6 members each
          </p>
        </div>
      </div>

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
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                      <p className="text-x-gray text-sm">
                        Created {new Date(circle.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
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
                    onClick={() => handleViewMembers(circle)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 border border-x-border rounded-lg hover:bg-x-hover transition text-sm"
                  >
                    <Eye size={14} />
                    <span>Members</span>
                  </button>
                  <button
                    onClick={() => handleViewAnalytics(circle)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 border border-x-border rounded-lg hover:bg-x-hover transition text-sm"
                  >
                    <BarChart3 size={14} />
                    <span>Analytics</span>
                  </button>
                  <button
                    onClick={() => leaveCircle(circle.id, circle.name)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition text-sm"
                  >
                    <UserMinus size={14} />
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
            className="w-full px-4 py-3 bg-black border border-x-border rounded-xl focus:outline-none focus:border-x-blue mb-3 transition placeholder:text-gray-600" 
          />
          <Button 
            onClick={createCircle} 
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
            className="w-full px-4 py-3 bg-black border border-x-border rounded-xl focus:outline-none focus:border-x-blue mb-3 transition font-mono uppercase placeholder:text-gray-600" 
          />
          <Button 
            onClick={joinCircle} 
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
        {showMembersModal && selectedCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMembersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">{selectedCircle.name}</h3>
                  <p className="text-sm text-x-gray">
                    {circleMembers.length} {circleMembers.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
                <button onClick={() => setShowMembersModal(false)} className="text-x-gray hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {loadingMembers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-x-blue border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {circleMembers.map((member, i) => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 bg-black rounded-xl border border-x-border">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{member.username}</p>
                          <p className="text-xs text-x-gray">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {member.user_id === selectedCircle.created_by && (
                        <Crown size={18} className="text-yellow-500" />
                      )}
                    </div>
                  ))}
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAnalyticsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">{selectedCircle.name}</h3>
                  <p className="text-sm text-x-gray">Circle Analytics</p>
                </div>
                <button onClick={() => setShowAnalyticsModal(false)} className="text-x-gray hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-x-blue border-t-transparent"></div>
                </div>
              ) : circleAnalytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-x-border rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp size={16} className="text-blue-500" />
                        <span className="text-xs text-x-gray">Total Sessions</span>
                      </div>
                      <p className="text-2xl font-bold">{circleAnalytics.totalSessions}</p>
                    </div>
                    <div className="border border-x-border rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock size={16} className="text-purple-500" />
                        <span className="text-xs text-x-gray">Total Time</span>
                      </div>
                      <p className="text-2xl font-bold">{formatDuration(circleAnalytics.totalTime)}</p>
                    </div>
                    <div className="border border-x-border rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users size={16} className="text-green-500" />
                        <span className="text-xs text-x-gray">Active Members</span>
                      </div>
                      <p className="text-2xl font-bold">{circleAnalytics.activeMembers}</p>
                    </div>
                    <div className="border border-x-border rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award size={16} className="text-yellow-500" />
                        <span className="text-xs text-x-gray">Avg Duration</span>
                      </div>
                      <p className="text-2xl font-bold">{formatDuration(circleAnalytics.avgDuration)}</p>
                    </div>
                  </div>

                  {circleAnalytics.topPerformer && (
                    <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown size={18} className="text-yellow-500" />
                        <span className="text-sm font-semibold">Top Performer</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{circleAnalytics.topPerformer.username}</p>
                        <div className="text-right">
                          <p className="font-semibold">{formatDuration(circleAnalytics.topPerformer.totalTime)}</p>
                          <p className="text-xs text-x-gray">{circleAnalytics.topPerformer.sessions} sessions</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-x-gray">No analytics data available yet</p>
                  <p className="text-sm text-x-gray mt-2">Complete some sessions to see stats!</p>
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
