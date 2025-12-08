import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Users, Trophy, Play, Clock, Target, Award, TrendingUp,
  ArrowRight, Sparkles, Menu, X as CloseIcon, CheckCircle,
  Activity, BarChart3, Shield, Smartphone, Monitor, Star,
  UserPlus, Globe, Lock, Rocket
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

      {/* Features Section */}
      <div id="features" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400">Everything you need to stay synchronized</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-gray-800 rounded-2xl p-8 bg-gray-900/30 hover:bg-gray-900/50 transition"
            >
              <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Session Tracking</h3>
              <p className="text-gray-400">
                Track your time with precision. Start and stop sessions with one click, view detailed history.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border border-gray-800 rounded-2xl p-8 bg-gray-900/30 hover:bg-gray-900/50 transition"
            >
              <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Users className="text-purple-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Circles</h3>
              <p className="text-gray-400">
                Create circles for your squad. Invite friends, track together, compete on leaderboards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border border-gray-800 rounded-2xl p-8 bg-gray-900/30 hover:bg-gray-900/50 transition"
            >
              <div className="h-12 w-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4">
                <Trophy className="text-yellow-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Achievements</h3>
              <p className="text-gray-400">
                Unlock 47 unique achievements. Level up through 50 ranks. Earn XP for every session.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="border border-gray-800 rounded-2xl p-8 bg-gray-900/30 hover:bg-gray-900/50 transition"
            >
              <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <Activity className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Sync</h3>
              <p className="text-gray-400">
                See who's active right now. Live updates when friends start and stop sessions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="border border-gray-800 rounded-2xl p-8 bg-gray-900/30 hover:bg-gray-900/50 transition"
            >
              <div className="h-12 w-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="text-pink-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Analytics</h3>
              <p className="text-gray-400">
                Track your progress with detailed analytics. Total time, average session length, and more.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="border border-gray-800 rounded-2xl p-8 bg-gray-900/30 hover:bg-gray-900/50 transition"
            >
              <div className="h-12 w-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Leaderboards</h3>
              <p className="text-gray-400">
                Compete with your circle. See who's logging the most time and climbing the ranks.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* App Preview Section */}
      <div id="preview" className="relative py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-gray-400">Clean, modern interface designed for speed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border-2 border-gray-800 overflow-hidden shadow-2xl"
          >
            <div className="bg-gray-900 px-4 py-3 flex items-center space-x-2 border-b border-gray-800">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center text-sm text-gray-500">goonsync.com</div>
            </div>
            <div className="bg-black p-8">
              <div className="max-w-md mx-auto space-y-6">
                <div className="border border-gray-800 rounded-2xl p-6 bg-gray-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Current Session</p>
                      <p className="text-3xl font-bold">25:47</p>
                    </div>
                    <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <Play className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/30">
                    <p className="text-sm text-gray-400 mb-1">Level</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/30">
                    <p className="text-sm text-gray-400 mb-1">XP</p>
                    <p className="text-2xl font-bold">2,450</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why GoonSync?</h2>
            <p className="text-xl text-gray-400">Built for modern teams and squads</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-blue-500" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Free Forever</h3>
                  <p className="text-gray-400">No credit card required. All features included. No hidden costs.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="text-purple-500" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
                  <p className="text-gray-400">Your data is encrypted and secure. We never sell your information.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="text-green-500" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Works Everywhere</h3>
                  <p className="text-gray-400">Desktop, mobile, tablet. Access from anywhere with internet.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Rocket className="text-yellow-500" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
                  <p className="text-gray-400">Optimized for speed. Real-time updates with zero lag.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <UserPlus className="text-pink-500" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Easy To Use</h3>
                  <p className="text-gray-400">Intuitive interface. Get started in seconds, no learning curve.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Globe className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Always Online</h3>
                  <p className="text-gray-400">99.9% uptime. Reliable infrastructure you can count on.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="border-2 border-gray-800 rounded-3xl p-12 md:p-16 bg-gradient-to-br from-gray-900 to-black text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to sync with your squad?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users tracking their progress together. Free forever, no credit card required.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-gray-100 transition shadow-2xl inline-flex items-center"
            >
              Get Started Free <ArrowRight className="ml-3" size={24} />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold">GoonSync</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 GoonSync. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { EnhancedLanding, fetchLandingStats };
export default EnhancedLanding;
