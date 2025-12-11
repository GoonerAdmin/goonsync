import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Users, Plus, Search, UserPlus, Crown, Clock } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

const CirclesView = () => {
  const navigate = useNavigate();
  const [circles, setCircles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user's circles
      const { data: circlesData } = await supabase
        .from('circle_members')
        .select(`
          circle_id,
          role,
          circles (
            id,
            name,
            description,
            created_at,
            created_by
          )
        `)
        .eq('user_id', user.id);

      // Get member counts for each circle
      const circlesWithCounts = await Promise.all(
        circlesData.map(async (item) => {
          const { count } = await supabase
            .from('circle_members')
            .select('*', { count: 'exact', head: true })
            .eq('circle_id', item.circles.id);

          return {
            ...item.circles,
            memberCount: count,
            userRole: item.role,
            isOwner: item.circles.created_by === user.id,
          };
        })
      );

      setCircles(circlesWithCounts);
    } catch (error) {
      console.error('Error loading circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCircle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create circle
      const { data: circle, error: circleError } = await supabase
        .from('circles')
        .insert([
          {
            name: newCircle.name,
            description: newCircle.description,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (circleError) throw circleError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert([
          {
            circle_id: circle.id,
            user_id: user.id,
            role: 'owner',
          },
        ]);

      if (memberError) throw memberError;

      // Reset and reload
      setNewCircle({ name: '', description: '' });
      setShowCreateModal(false);
      loadCircles();
    } catch (error) {
      console.error('Error creating circle:', error);
    }
  };

  const filteredCircles = circles.filter((circle) =>
    circle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="text-white text-xl">Loading circles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Circles</h1>
            <p className="text-gray-400">Squads you're part of</p>
          </div>

          <GlassButton 
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Create Circle
          </GlassButton>
        </div>

        {/* Search Bar */}
        <GlassCard className="p-4" hover={false}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search circles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-white pl-10 pr-4 py-2 focus:outline-none"
            />
          </div>
        </GlassCard>

        {/* Circles Grid */}
        {filteredCircles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCircles.map((circle) => (
              <GlassCard 
                key={circle.id}
                className="p-6 cursor-pointer"
                onClick={() => navigate(`/circles/${circle.id}`)}
              >
                {/* Circle Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-xp-gradient/20 border border-xp-green/30 flex items-center justify-center">
                    <Users size={32} className="text-xp-green" />
                  </div>

                  {/* Owner badge */}
                  {circle.isOwner && (
                    <div className="px-2 py-1 rounded-lg bg-achievement-gold/20 border border-achievement-gold/30 flex items-center gap-1">
                      <Crown size={14} className="text-achievement-gold" />
                      <span className="text-xs font-medium text-achievement-gold">Owner</span>
                    </div>
                  )}
                </div>

                {/* Circle Info */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {circle.name}
                </h3>

                {circle.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {circle.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <UserPlus size={16} />
                    <span>{circle.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{new Date(circle.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm ? 'No circles found' : 'No circles yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Create your first circle to get started!'
              }
            </p>
            {!searchTerm && (
              <GlassButton 
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Circle
              </GlassButton>
            )}
          </GlassCard>
        )}

        {/* Create Circle Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <GlassCard className="w-full max-w-md p-8" hover={false}>
              <h2 className="text-2xl font-bold text-white mb-6">Create New Circle</h2>

              <div className="space-y-4">
                {/* Name input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Circle Name
                  </label>
                  <input
                    type="text"
                    value={newCircle.name}
                    onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                    placeholder="Enter circle name..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-xp-green"
                  />
                </div>

                {/* Description input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newCircle.description}
                    onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
                    placeholder="What's this circle about?"
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-xp-green resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <GlassButton
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewCircle({ name: '', description: '' });
                    }}
                    fullWidth
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    onClick={createCircle}
                    disabled={!newCircle.name.trim()}
                    fullWidth
                  >
                    Create
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default CirclesView;
