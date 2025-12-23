import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Trophy, Clock, Star, Sparkles, ArrowRight, Play } from 'lucide-react';

export const EnhancedLanding = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="mb-12 inline-block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-75" />
                <div className="relative h-32 w-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Zap size={64} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GoonSync
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
                Sync Sessions. Earn XP. Dominate Together.
              </p>
              <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                The ultimate social productivity platform for coordinating with your crew, tracking progress, and climbing the leaderboards.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mb-16"
            >
              <button
                onClick={onGetStarted}
                className="group relative inline-flex items-center space-x-3 px-12 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Play size={24} className="group-hover:translate-x-1 transition-transform" fill="currentColor" />
                <span>Get Started Free</span>
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-gray-500 text-sm mt-4">No credit card required • Join 1,000+ users</p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <div className="flex items-center space-x-2 px-6 py-3 bg-gray-900/50 border border-gray-800 rounded-full backdrop-blur-sm">
                <Users size={20} className="text-blue-400" />
                <span className="text-gray-300 font-medium">Social Circles</span>
              </div>
              <div className="flex items-center space-x-2 px-6 py-3 bg-gray-900/50 border border-gray-800 rounded-full backdrop-blur-sm">
                <Trophy size={20} className="text-yellow-400" />
                <span className="text-gray-300 font-medium">47 Achievements</span>
              </div>
              <div className="flex items-center space-x-2 px-6 py-3 bg-gray-900/50 border border-gray-800 rounded-full backdrop-blur-sm">
                <Clock size={20} className="text-green-400" />
                <span className="text-gray-300 font-medium">Real-time Tracking</span>
              </div>
              <div className="flex items-center space-x-2 px-6 py-3 bg-gray-900/50 border border-gray-800 rounded-full backdrop-blur-sm">
                <Star size={20} className="text-purple-400" />
                <span className="text-gray-300 font-medium">50 Levels</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Why <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">GoonSync?</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Built for teams who want to stay in sync, track their time, and compete together.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl hover:border-blue-500/50 transition-all duration-300">
                  <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                    <Users size={32} className="text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Social Circles</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Create circles with up to 6 friends. Share invite codes, sync sessions in real-time, and see who's active now.
                  </p>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl hover:border-purple-500/50 transition-all duration-300">
                  <div className="h-16 w-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                    <Trophy size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Level Up System</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Earn XP for every session, unlock 47 unique achievements, and climb to level 50. Compete on leaderboards and show off your progress.
                  </p>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-600/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl hover:border-pink-500/50 transition-all duration-300">
                  <div className="h-16 w-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles size={32} className="text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Real-time Analytics</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Track your sessions, view detailed analytics, see active members, and monitor your progress with beautiful dashboards.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
              <div className="relative p-16 bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-800 rounded-3xl backdrop-blur-sm">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">sync up?</span>
                </h2>
                <p className="text-xl text-gray-400 mb-10">
                  Join thousands of users already tracking their progress together
                </p>
                <button
                  onClick={onGetStarted}
                  className="group inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span>Start Free Now</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="py-8 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
            <p>© 2024 GoonSync. Built for productivity enthusiasts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
