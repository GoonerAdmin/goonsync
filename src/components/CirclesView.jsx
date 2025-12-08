import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, TrendingUp, Clock, Trophy, 
  X as CloseIcon, UserPlus, ChevronRight, Award, LogOut
} from 'lucide-react';
import Button from './Button';

const CirclesView = ({ 
  user, 
  profile, 
  circles, 
  onCreateCircle, 
  onJoinCircle,
  leaderboard,
  onLoadLeaderboard,
  supabase  // ← CRITICAL: Receives API client
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [circleName, setCircleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  
  // Circle details state
  const [circleMembers, setCircleMembers] = useState([]);
  const [circleStats, setCircleStats] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!circleName.trim()) return;

    setCreating(true);
    setError('');

    try {
      await onCreateCircle(circleName.trim());
      setCircleName('');
      setShowCreateModal(false);
    } catch (err) {
      setError(err.message || 'Failed to create circle');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setJoining(true);
    setError('');

    try {
      await onJoinCircle(searchCode.trim());
      setSearchCode('');
      setShowJoinModal(false);
    } catch (err) {
      setError(err.message || 'Failed to join circle');
    } finally {
      setJoining(false);
    }
  };

  const openCircleDetails = async (circle) => {
    setSelectedCircle(circle);
    setShowDetailsModal(true);
    setCircleMembers([]);
    setCircleStats(null);
    
    // Load circle members and stats
    await loadCircleDetails(circle.id);
  };

  const loadCircleDetails = async (circleId) => {
    if (!supabase) {
      console.error('Supabase client not provided to CirclesView');
      return;
    }

    setLoadingDetails(true);

    try {
      // Load members with their profile info
      const { data: members, error: membersError } = await supabase
        .from('circle_members')
        .select(`
          user_id,
          joined_at,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('circle_id', circleId);

      if (membersError) throw membersError;

      // Transform data for easier use
      const formattedMembers = members?.map(m => ({
        id: m.user_id,
        username: m.profiles?.username || 'Unknown',
        avatar_url: m.profiles?.avatar_url,
        joined_at: m.joined_at
      })) || [];

      setCircleMembers(formattedMembers);

      // Load circle stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('user_id, duration_seconds')
        .eq('circle_id', circleId);

      if (sessionsError) throw sessionsError;

      // Calculate stats
      const totalSessions = sessions?.length || 0;
      const totalTime = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
      const avgTime = totalSessions > 0 ? Math.floor(totalTime / totalSessions) : 0;

      setCircleStats({
        totalSessions,
        totalTime,
        avgTime,
        memberCount: formattedMembers.length
      });

      // Load leaderboard for this circle
      if (onLoadLeaderboard) {
        await onLoadLeaderboard(circleId);
      }

    } catch (error) {
      console.error('Error loading circle details:', error);
      setError('Failed to load circle details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleLeaveCircle = async (circleId) => {
    if (!supabase) return;
    if (!window.confirm('Are you sure you want to leave this circle?')) return;

    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('circle_id', circleId)
        .eq('user_id', user.id);

      if (error) throw error;

      setShowDetailsModal(false);
      setSelectedCircle(null);
      
      // Refresh circles list
      window.location.reload(); // Simple refresh - better would be to call a refresh function

    } catch (error) {
      console.error('Error leaving circle:', error);
      setError('Failed to leave circle');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center space-x-2 text-white">
            <Users size={24} className="text-purple-500" />
            <span>Circles</span>
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowJoinModal(true)}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Join</span>
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Circles List */}
      <div className="p-4 space-y-4">
        {circles.length === 0 ? (
          <div className="border border-gray-800 rounded-2xl p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-4">You're not in any circles yet</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
              >
                <Plus size={16} className="mr-2" />
                Create Circle
              </Button>
              <Button
                onClick={() => setShowJoinModal(true)}
                variant="secondary"
              >
                <Search size={16} className="mr-2" />
                Join Circle
              </Button>
            </div>
          </div>
        ) : (
          circles.map((circle) => (
            <motion.div
              key={circle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30 hover:bg-gray-900/50 transition cursor-pointer"
              onClick={() => openCircleDetails(circle)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{circle.name}</h3>
                      <p className="text-sm text-gray-400">
                        Code: {circle.invite_code}
                      </p>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Circle Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create Circle</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <CloseIcon size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Circle Name
                  </label>
                  <input
                    type="text"
                    value={circleName}
                    onChange={(e) => setCircleName(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:border-purple-500 focus:outline-none transition"
                    placeholder="Enter circle name"
                    maxLength={50}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Circle'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Circle Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Join Circle</h3>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <CloseIcon size={24} />
                </button>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none transition uppercase"
                    placeholder="ABC123"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={joining}
                >
                  {joining ? 'Joining...' : 'Join Circle'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circle Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {selectedCircle.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Code: <span className="font-mono">{selectedCircle.invite_code}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <CloseIcon size={24} />
                </button>
              </div>

              {/* Stats */}
              {circleStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="border border-gray-800 rounded-xl p-3 bg-black/50">
                    <p className="text-xs text-gray-400 mb-1">Members</p>
                    <p className="text-xl font-bold text-white">
                      {circleStats.memberCount}
                    </p>
                  </div>
                  <div className="border border-gray-800 rounded-xl p-3 bg-black/50">
                    <p className="text-xs text-gray-400 mb-1">Sessions</p>
                    <p className="text-xl font-bold text-white">
                      {circleStats.totalSessions}
                    </p>
                  </div>
                  <div className="border border-gray-800 rounded-xl p-3 bg-black/50">
                    <p className="text-xs text-gray-400 mb-1">Total Time</p>
                    <p className="text-xl font-bold text-white">
                      {formatTime(circleStats.totalTime)}
                    </p>
                  </div>
                  <div className="border border-gray-800 rounded-xl p-3 bg-black/50">
                    <p className="text-xs text-gray-400 mb-1">Avg Time</p>
                    <p className="text-xl font-bold text-white">
                      {formatTime(circleStats.avgTime)}
                    </p>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                  <Users size={18} className="text-purple-500" />
                  <span>Members</span>
                </h4>
                
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading members...</p>
                  </div>
                ) : circleMembers.length === 0 ? (
                  <div className="text-center py-8 border border-gray-800 rounded-xl">
                    <Users size={32} className="mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-400">No members found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {circleMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.username}
                              className="h-10 w-10 rounded-full object-cover border border-gray-700"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Users size={20} className="text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">
                              {member.username}
                              {member.id === user.id && (
                                <span className="ml-2 text-xs text-gray-400">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              Joined {formatDate(member.joined_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              {leaderboard && leaderboard.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                    <Trophy size={18} className="text-yellow-500" />
                    <span>Leaderboard</span>
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`
                            h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-yellow-500 text-black' : ''}
                            ${index === 1 ? 'bg-gray-400 text-black' : ''}
                            ${index === 2 ? 'bg-orange-600 text-white' : ''}
                            ${index > 2 ? 'bg-gray-800 text-gray-400' : ''}
                          `}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {entry.username || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {entry.session_count} sessions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            {formatTime(entry.total_time)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leave Circle Button */}
              <Button
                onClick={() => handleLeaveCircle(selectedCircle.id)}
                variant="danger"
                className="w-full flex items-center justify-center space-x-2"
              >
                <LogOut size={16} />
                <span>Leave Circle</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CirclesView;
