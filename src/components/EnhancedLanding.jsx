import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Zap, Users, Trophy, Target, Sparkles, ArrowRight, X } from 'lucide-react';

const EnhancedLanding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
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

  const openSignUp = () => {
    console.log('Opening sign up modal');
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const openSignIn = () => {
    console.log('Opening sign in modal');
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-dark-base relative overflow-hidden">
      {/* Animated background */}
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

          <motion.button
            onClick={openSignIn}
            className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-xp-green/10 border border-xp-green/30 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles size={16} className="text-xp-green" />
              <span className="text-xp-green font-medium">Level up your social experience</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Sync Your Life,
              <br />
              <span className="text-transparent bg-clip-text bg-xp-gradient">
                Level Up Together
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Real-time social synchronization meets gamification. Track your progress, unlock achievements, and build circles with friends.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={openSignUp}
                className="px-8 py-4 bg-xp-gradient text-white rounded-xl font-medium shadow-glow-green flex items-center gap-2 text-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,136,0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                Start For Free
                <ArrowRight size={20} />
              </motion.button>

              <motion.button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
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
            </motion.div>
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
            {/* Feature Cards */}
            {[
              { icon: Zap, title: 'XP System', desc: 'Earn XP for every action. Level up and unlock exclusive rewards.', color: 'xp-green' },
              { icon: Trophy, title: 'Achievements', desc: '47 unique badges across 4 rarity tiers. Show off your progress.', color: 'rarity-rare' },
              { icon: Users, title: 'Social Circles', desc: 'Create squads, sync with friends, and build your community.', color: 'rarity-epic' },
              { icon: Target, title: 'Real-time Sync', desc: 'Live updates across all devices. Stay connected anywhere.', color: 'achievement-gold' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -5 }}
              >
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}/20 border border-${feature.color}/30 flex items-center justify-center mb-4`}>
                  <feature.icon className={`text-${feature.color}`} size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join GoonSync today and level up your social experience.
            </p>
            <motion.button
              onClick={openSignUp}
              className="px-8 py-4 bg-xp-gradient text-white rounded-xl font-medium shadow-glow-green flex items-center gap-2 text-lg mx-auto"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,136,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Now
              <ArrowRight size={20} />
            </motion.button>
          </div>
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
          <motion.div
            className="w-full max-w-md p-8 bg-dark-secondary/95 backdrop-blur-glass border border-white/10 rounded-3xl shadow-glass relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              onClick={() => {
                setShowAuthModal(false);
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-xp-gradient text-white rounded-xl font-medium shadow-glow-green hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>

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
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLanding;
