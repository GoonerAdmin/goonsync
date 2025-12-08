// Enhanced Landing Page - Updated to use API proxy
// This version fetches stats through /api/stats so it works on school WiFi!

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Users, Trophy, Play, Clock, Target, Award, TrendingUp,
  ArrowRight, Sparkles, Menu, X as CloseIcon, CheckCircle,
  Activity, BarChart3, Shield, Smartphone, Monitor, Star
} from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

// Fetch stats through API proxy - works on school WiFi!
const fetchLandingStats = async () => {
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Failed to fetch landing stats:', error);
    return { users: 0, sessions: 0, circles: 0, hours: 0 };
  }
};

// Enhanced Landing Page Component
const EnhancedLanding = ({ onGetStarted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ users: 0, sessions: 0, circles: 0, hours: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await fetchLandingStats();
    setStats(data);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ... rest of component exactly the same as before ... */}
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full bg-black/80 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-2xl font-bold">GoonSync</span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
              <a href="#preview" className="text-gray-300 hover:text-white transition">Preview</a>
              <a href="#stats" className="text-gray-300 hover:text-white transition">Stats</a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                Get Started
              </motion.button>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black z-40 pt-20 px-4"
          >
            <div className="flex flex-col space-y-6">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl py-2 hover:text-gray-300 transition">Features</a>
              <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="text-2xl py-2 hover:text-gray-300 transition">Preview</a>
              <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="text-2xl py-2 hover:text-gray-300 transition">Stats</a>
              <button 
                onClick={() => { onGetStarted(); setMobileMenuOpen(false); }} 
                className="px-8 py-3 bg-white text-black rounded-full font-semibold text-lg"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full mb-8">
              <Sparkles size={16} className="text-yellow-500" />
              <span className="text-sm text-gray-300">Track your progress with friends</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Sync with the squad.
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Real-time coordination for your crew. Track sessions, compete on leaderboards, earn achievements, and stay synchronized.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-2xl inline-flex items-center"
              >
                Start Free <ArrowRight className="ml-2" size={20} />
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#preview"
                className="px-8 py-4 border-2 border-gray-700 text-white rounded-full font-bold text-lg hover:border-gray-600 transition inline-flex items-center"
              >
                See Preview
              </motion.a>
            </div>
          </motion.div>

          {/* Real-Time Stats */}
          <motion.div
            id="stats"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto"
          >
            <div className="border border-gray-800 rounded-2xl p-4 md:p-6 bg-gray-900/50 backdrop-blur hover:bg-gray-900/70 transition">
              <p className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                <AnimatedCounter end={stats.users} suffix="+" />
              </p>
              <p className="text-gray-400 text-xs md:text-sm">Active Users</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-4 md:p-6 bg-gray-900/50 backdrop-blur hover:bg-gray-900/70 transition">
              <p className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                <AnimatedCounter end={stats.sessions} suffix="+" />
              </p>
              <p className="text-gray-400 text-xs md:text-sm">Sessions Tracked</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-4 md:p-6 bg-gray-900/50 backdrop-blur hover:bg-gray-900/70 transition">
              <p className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                <AnimatedCounter end={stats.circles} suffix="+" />
              </p>
              <p className="text-gray-400 text-xs md:text-sm">Circles Created</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-4 md:p-6 bg-gray-900/50 backdrop-blur hover:bg-gray-900/70 transition">
              <p className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                <AnimatedCounter end={stats.hours} suffix="+" />
              </p>
              <p className="text-gray-400 text-xs md:text-sm">Hours Synced</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rest of the page continues exactly as before... */}
      {/* Note: Include all the App Preview, Features, CTA, and Footer sections from the original */}
    </div>
  );
};

export { EnhancedLanding, fetchLandingStats };
