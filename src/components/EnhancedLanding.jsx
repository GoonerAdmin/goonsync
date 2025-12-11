import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Zap, Users, Trophy, Target, Sparkles, ArrowRight } from 'lucide-react';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

const EnhancedLanding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'signin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'signup') {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });

        if (signUpError) throw signUpError;

        // Create profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              username: username,
              email: email,
              level: 1,
              experience_points: 0,
            }]);

          if (profileError) throw profileError;
        }

        alert('Sign up successful! Check your email for verification.');
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-base relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-xp-green/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-rarity-rare/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-xp-gradient flex items-center justify-center shadow-glow-green">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-white">GoonSync</span>
          </div>

          <GlassButton
            variant="secondary"
            onClick={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
          >
            Sign In
          </GlassButton>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-xp-green/10 border border-xp-green/30 mb-6">
              <Sparkles size={16} className="text-xp-green" />
              <span className="text-xp-green font-medium">Level up your social experience</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Sync Your Life,
              <br />
              <span className="text-transparent bg-clip-text bg-xp-gradient">
                Level Up Together
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Real-time social synchronization meets gamification. Track your progress, unlock achievements, and build circles with friends.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4">
              <GlassButton
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
              >
                Start For Free
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="lg"
                onClick={() => {
                  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </GlassButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
              <div>
                <div className="text-3xl font-bold text-xp-green mb-1">50</div>
                <div className="text-sm text-gray-400">Levels to Master</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-xp-green mb-1">47</div>
                <div className="text-sm text-gray-400">Achievements</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-xp-green mb-1">∞</div>
                <div className="text-sm text-gray-400">Circles to Join</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Level Up
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features designed for social syncing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <GlassCard className="p-6">
              <div className="w-12 h-12 rounded-lg bg-xp-gradient/20 border border-xp-green/30 flex items-center justify-center mb-4">
                <Zap className="text-xp-green" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">XP System</h3>
              <p className="text-gray-400">
                Earn XP for every action. Level up and unlock exclusive rewards.
              </p>
            </GlassCard>

            {/* Feature 2 */}
            <GlassCard className="p-6">
              <div className="w-12 h-12 rounded-lg bg-rarity-rare/20 border border-rarity-rare/30 flex items-center justify-center mb-4">
                <Trophy className="text-rarity-rare" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Achievements</h3>
              <p className="text-gray-400">
                47 unique badges across 4 rarity tiers. Show off your progress.
              </p>
            </GlassCard>

            {/* Feature 3 */}
            <GlassCard className="p-6">
              <div className="w-12 h-12 rounded-lg bg-rarity-epic/20 border border-rarity-epic/30 flex items-center justify-center mb-4">
                <Users className="text-rarity-epic" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Social Circles</h3>
              <p className="text-gray-400">
                Create squads, sync with friends, and build your community.
              </p>
            </GlassCard>

            {/* Feature 4 */}
            <GlassCard className="p-6">
              <div className="w-12 h-12 rounded-lg bg-achievement-gold/20 border border-achievement-gold/30 flex items-center justify-center mb-4">
                <Target className="text-achievement-gold" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-time Sync</h3>
              <p className="text-gray-400">
                Live updates across all devices. Stay connected anywhere.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join GoonSync today and level up your social experience.
            </p>
            <GlassButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
            >
              Get Started Now
            </GlassButton>
          </GlassCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-xp-gradient flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="text-white font-medium">GoonSync</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 GoonSync. Level up together.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-8" hover={false}>
            <h2 className="text-2xl font-bold text-white mb-6">
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-xp-green"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-xp-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-xp-green"
                />
              </div>

              {error && (
                <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <GlassButton
                variant="primary"
                type="submit"
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? 'Loading...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </GlassButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                  className="text-sm text-gray-400 hover:text-xp-green transition-colors"
                >
                  {authMode === 'signup' 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>

            <button
              onClick={() => {
                setShowAuthModal(false);
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default EnhancedLanding;
