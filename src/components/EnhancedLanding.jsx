// Enhanced Landing Page with Real-Time Stats and App Preview
// This replaces the landing page section in App.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Users, Trophy, Play, Clock, Target, Award, TrendingUp,
  ArrowRight, Sparkles, Menu, X as CloseIcon, CheckCircle,
  Activity, BarChart3, Shield, Smartphone, Monitor, Star
} from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

// Stats fetching function (add this to your App.js)
const fetchLandingStats = async (supabase) => {
  try {
    // Get total users
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total sessions
    const { count: sessionsCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    // Get total circles
    const { count: circlesCount } = await supabase
      .from('circles')
      .select('*', { count: 'exact', head: true });

    // Get total time tracked (in hours)
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('duration_seconds');
    
    const totalHours = sessionsData
      ? Math.floor(sessionsData.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 3600)
      : 0;

    return {
      users: usersCount || 0,
      sessions: sessionsCount || 0,
      circles: circlesCount || 0,
      hours: totalHours
    };
  } catch (error) {
    console.error('Failed to fetch landing stats:', error);
    return { users: 0, sessions: 0, circles: 0, hours: 0 };
  }
};

// Enhanced Landing Page Component
const EnhancedLanding = ({ supabase, onGetStarted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ users: 0, sessions: 0, circles: 0, hours: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (supabase) {
      const data = await fetchLandingStats(supabase);
      setStats(data);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
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

      {/* App Preview Section - NEW! */}
      <div id="preview" className="py-20 px-4 border-y border-gray-800 bg-gradient-to-b from-black via-gray-900/20 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">See GoonSync in Action</h2>
            <p className="text-gray-400 text-lg">A powerful, intuitive interface designed for teams</p>
          </motion.div>

          {/* Feature Showcase Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border border-gray-800 rounded-3xl p-8 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Activity size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Live Dashboard</h3>
                  <p className="text-sm text-gray-400">Real-time sync status</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">See who's active right now</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">One-click start/stop tracking</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Live timer with elapsed time</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">XP bar showing level progress</span>
                </li>
              </ul>
            </motion.div>

            {/* Analytics Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border border-gray-800 rounded-3xl p-8 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Advanced Analytics</h3>
                  <p className="text-sm text-gray-400">Deep insights & trends</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Total sessions & time tracked</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Average duration & longest session</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Streak tracking & consistency</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Detailed session history</span>
                </li>
              </ul>
            </motion.div>

            {/* Leaderboards Preview */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border border-gray-800 rounded-3xl p-8 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Trophy size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Circle Leaderboards</h3>
                  <p className="text-sm text-gray-400">Compete with friends</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Real-time rankings by total time</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">See top performers with medals</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Track your rank in each circle</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Highlighted personal stats</span>
                </li>
              </ul>
            </motion.div>

            {/* Achievements Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border border-gray-800 rounded-3xl p-8 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Star size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Achievements & XP</h3>
                  <p className="text-sm text-gray-400">Level up your game</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">47 unique achievements to unlock</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">50-level progression system</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Earn XP with every session</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Unlock notifications & rewards</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Cross-Platform */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-gray-800 rounded-3xl p-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-center"
          >
            <div className="flex justify-center space-x-4 mb-6">
              <div className="h-16 w-16 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-700">
                <Monitor size={32} className="text-blue-400" />
              </div>
              <div className="h-16 w-16 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-700">
                <Smartphone size={32} className="text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">Works Everywhere</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Access GoonSync from any device. Fully responsive design works seamlessly on desktop, tablet, and mobile.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg">Powerful features to keep your squad in sync</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Private Circles', desc: 'Create exclusive groups with invite codes. Max 6 members per circle.', color: 'from-blue-500 to-cyan-500' },
              { icon: Trophy, title: 'Live Leaderboards', desc: 'Compete with your circle in real-time. Track rankings and personal bests.', color: 'from-yellow-500 to-orange-500' },
              { icon: TrendingUp, title: 'Advanced Analytics', desc: 'Deep insights with session history, trends, and streak tracking.', color: 'from-purple-500 to-pink-500' },
              { icon: Clock, title: 'Session Tracking', desc: 'Automatic time tracking with start/stop controls and live timers.', color: 'from-green-500 to-emerald-500' },
              { icon: Award, title: 'Achievements System', desc: 'Unlock 47 achievements across 5 difficulty tiers as you progress.', color: 'from-pink-500 to-red-500' },
              { icon: Target, title: 'XP & Levels', desc: '50-level progression system. Earn XP every minute and unlock new titles.', color: 'from-indigo-500 to-purple-500' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-gray-800 rounded-2xl p-6 bg-gray-900/30 hover:bg-gray-900/50 hover:border-gray-700 transition group"
              >
                <div className={`h-12 w-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 border-t border-gray-800 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Join <span className="text-white font-bold"><AnimatedCounter end={stats.users} />+</span> users tracking their progress
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-12 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-gray-100 transition shadow-2xl inline-flex items-center"
            >
              Start Syncing Free <ArrowRight className="ml-3" size={24} />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold">GoonSync</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 GoonSync. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export { EnhancedLanding, fetchLandingStats };
