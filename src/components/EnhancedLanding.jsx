import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Trophy, Sparkles, ArrowRight } from 'lucide-react';

export const EnhancedLanding = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (isLogin) {
        await onLogin(username, password);
      } else {
        await onSignup(username, password);
      }
    } catch (error) {
      setAuthError(error.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Left Side */}
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left Side - Branding */}
        <div className="flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo */}
              <div className="inline-flex items-center justify-center mb-8">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Zap size={40} className="text-white" />
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GoonSync
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-gray-300 mb-8">
                Sync sessions, earn XP, compete with friends.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Social Circles</p>
                    <p className="text-sm text-gray-400">Create circles with up to 6 friends</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Trophy size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold">47 Achievements</p>
                    <p className="text-sm text-gray-400">Unlock achievements and level up</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles size={20} className="text-pink-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Real-time Sync</p>
                    <p className="text-sm text-gray-400">Track sessions instantly</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br from-gray-900 to-black border-l border-gray-800">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-gray-400">
                  {isLogin ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl p-4 mb-6 text-sm">
                  {authError}
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
                    placeholder="Enter username"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle Login/Signup */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setAuthError('');
                  }}
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
