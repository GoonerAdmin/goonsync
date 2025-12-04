import React, { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp, History, Trophy, Crown, Plus, Link2, Play, Square, Mail, ArrowRight, Menu, X as CloseIcon, Sparkles, Zap, Target, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import ProfileView from './components/ProfileView';
import CirclesView from './components/CirclesView';
import Settings from './components/Settings';
import Button from './components/Button';
import { supabase } from './supabaseClient';

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStartTime, setSyncStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [circles, setCircles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        setView('dashboard');
      } else {
        setView('landing');
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    // Try to load profile, retry if it doesn't exist yet (trigger may still be running)
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
        return;
      }
      
      if (error && error.code !== 'PGRST116') {
        // Real error (not just "not found")
        console.error('Profile load error:', error);
        break;
      }
      
      // Profile not found yet, wait and retry
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If we get here, profile still doesn't exist - try to create it manually
    console.log('Profile not found after retries, creating manually...');
    const username = userId.substring(0, 8);
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert([{ id: userId, username: username, avatar_url: null }])
      .select()
      .single();
    
    if (newProfile) setProfile(newProfile);
  };

  const loadCircles = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('circle_members')
      .select('circle_id, circles(id, name, invite_code, created_by, created_at)')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Failed to load circles:', error);
    }
    
    if (data) {
      console.log('Loaded circles:', data);
      setCircles(data.map(d => d.circles));
    }
  };

  const loadSessions = async () => {
    if (!user) return;
    const { data } = await supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (data) setSessions(data);
  };

  const loadActiveUsers = async () => {
    if (!user || circles.length === 0) return;
    const circleIds = circles.map(c => c.id);
    const { data } = await supabase.from('active_syncs').select('*').in('circle_id', circleIds);
    if (data) setActiveUsers(data);
  };

  const loadLeaderboard = async (circleId) => {
    if (!circleId) return;
    const { data } = await supabase.from('sessions').select('user_id, username, duration_seconds').eq('circle_id', circleId).not('duration_seconds', 'is', null);
    if (data) {
      const userStats = {};
      data.forEach(session => {
        if (!userStats[session.user_id]) {
          userStats[session.user_id] = { username: session.username, totalSessions: 0, totalTime: 0, longestSession: 0 };
        }
        userStats[session.user_id].totalSessions += 1;
        userStats[session.user_id].totalTime += session.duration_seconds;
        userStats[session.user_id].longestSession = Math.max(userStats[session.user_id].longestSession, session.duration_seconds);
      });
      setLeaderboard(Object.values(userStats).sort((a, b) => b.totalTime - a.totalTime));
    }
  };

  useEffect(() => {
    if (!user || circles.length === 0) return;
    const subscription = supabase.channel('active_syncs_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'active_syncs' }, () => { loadActiveUsers(); }).subscribe();
    return () => { subscription.unsubscribe(); };
  }, [user, circles]);

  useEffect(() => { if (user) { loadCircles(); loadSessions(); } }, [user, view]);
  useEffect(() => { if (circles.length > 0) loadActiveUsers(); }, [circles]);

  useEffect(() => {
    let interval;
    if (isSyncing && syncStartTime) {
      interval = setInterval(() => { setElapsedTime(Math.floor((Date.now() - syncStartTime) / 1000)); }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSyncing, syncStartTime]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAuth = async () => {
    setLoading(true);
    setAuthError('');
    
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: username.includes('@') ? username : `${username}@goonsync.com`, 
        password 
      });
      if (error) {
        setAuthError(error.message);
        setLoading(false);
      } else { 
        // Wait for profile to load before showing dashboard
        await loadProfile(data.user.id);
        setShowLoginModal(false); 
        setView('dashboard'); 
        setUsername('');
        setPassword('');
        setLoading(false);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email: username.includes('@') ? username : `${username}@goonsync.com`, 
        password, 
        options: { data: { username: username.split('@')[0] } } 
      });
      if (error) {
        setAuthError(error.message);
        setLoading(false);
      } else { 
        // Wait a moment for trigger to create profile, then load it
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadProfile(data.user.id);
        
        setAuthError('');
        setShowLoginModal(false); 
        setView('dashboard');
        setUsername('');
        setPassword('');
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    if (isSyncing) await stopSync();
    await supabase.auth.signOut();
    setUser(null); 
    setProfile(null); 
    setView('landing'); 
    setUsername(''); 
    setPassword('');
  };

  const startSync = async () => {
    if (circles.length === 0) { 
      setAuthError('Join a circle first to start syncing!');
      setTimeout(() => setAuthError(''), 3000);
      return; 
    }
    const now = Date.now();
    setIsSyncing(true); 
    setSyncStartTime(now);
    const { data: sessionData } = await supabase.from('sessions').insert([{ 
      user_id: user.id, 
      username: profile.username, 
      start_time: new Date(now).toISOString(), 
      circle_id: circles[0].id 
    }]).select().single();
    if (sessionData) setCurrentSessionId(sessionData.id);
    for (const circle of circles) {
      await supabase.from('active_syncs').insert([{ 
        user_id: user.id, 
        username: profile.username, 
        circle_id: circle.id 
      }]);
    }
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('GoonSync', { body: `${profile.username} is syncing now!` });
    }
  };

  const stopSync = async () => {
    const duration = elapsedTime;
    if (currentSessionId) {
      await supabase.from('sessions').update({ 
        end_time: new Date().toISOString(), 
        duration_seconds: duration 
      }).eq('id', currentSessionId);
    }
    await supabase.from('active_syncs').delete().eq('user_id', user.id);
    setIsSyncing(false); 
    setSyncStartTime(null); 
    setElapsedTime(0); 
    setCurrentSessionId(null);
    loadSessions(); 
    loadActiveUsers();
  };

  const getAnalytics = () => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.duration_seconds);
    const totalTime = completedSessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const avgDuration = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;
    const longestSession = completedSessions.length > 0 ? Math.max(...completedSessions.map(s => s.duration_seconds)) : 0;
    return { totalSessions, totalTime, avgDuration, longestSession };
  };

  const analytics = user ? getAnalytics() : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-x-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Enhanced Landing Page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How It Works</a>
                <a href="#contact" className="text-gray-300 hover:text-white transition">Contact</a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLoginModal(true)}
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
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl py-2 hover:text-gray-300 transition">How It Works</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-2xl py-2 hover:text-gray-300 transition">Contact</a>
                <button 
                  onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} 
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
              
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Sync with the squad.
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Real-time coordination for your crew. Track sessions, compete on leaderboards, and stay synchronized.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLoginModal(true)}
                  className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-2xl inline-flex items-center"
                >
                  Start Free <ArrowRight className="ml-2" size={20} />
                </motion.button>
                
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-gray-700 text-white rounded-full font-bold text-lg hover:border-gray-600 transition inline-flex items-center"
                >
                  Learn More
                </motion.a>
              </div>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              <div className="border border-gray-800 rounded-2xl p-6 bg-gray-900/50 backdrop-blur">
                <p className="text-4xl font-bold mb-2">100+</p>
                <p className="text-gray-400 text-sm">Active Users</p>
              </div>
              <div className="border border-gray-800 rounded-2xl p-6 bg-gray-900/50 backdrop-blur">
                <p className="text-4xl font-bold mb-2">50K+</p>
                <p className="text-gray-400 text-sm">Sessions Tracked</p>
              </div>
              <div className="border border-gray-800 rounded-2xl p-6 bg-gray-900/50 backdrop-blur">
                <p className="text-4xl font-bold mb-2">24/7</p>
                <p className="text-gray-400 text-sm">Always Online</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="py-20 px-4 border-y border-gray-800 bg-gray-900/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 text-lg">Get started in three simple steps</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: 'Create or Join Circles', desc: 'Form groups with up to 6 members and sync together', color: 'from-blue-500 to-cyan-500' },
                { icon: Play, title: 'Start Syncing', desc: 'Track your sessions in real-time with automatic timers', color: 'from-purple-500 to-pink-500' },
                { icon: Trophy, title: 'Compete & Track', desc: 'View leaderboards and analytics to stay motivated', color: 'from-yellow-500 to-orange-500' }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative border border-gray-800 rounded-2xl p-8 bg-black hover:border-gray-700 transition group"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color} rounded-t-2xl`}></div>
                  <div className={`h-14 w-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                    <step.icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
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
                { icon: Users, title: 'Private Circles', desc: 'Create exclusive groups with invite codes. Max 6 members per circle, up to 3 circles on free tier.' },
                { icon: Trophy, title: 'Live Leaderboards', desc: 'Compete with your circle in real-time. Track total time, sessions, and personal bests.' },
                { icon: TrendingUp, title: 'Advanced Analytics', desc: 'Deep insights into your performance with charts, trends, and streak tracking.' },
                { icon: Clock, title: 'Session Tracking', desc: 'Automatic time tracking with start/stop controls. See who\'s active right now.' },
                { icon: Target, title: 'Goal Setting', desc: 'Set personal targets and track your progress towards achieving them.' },
                { icon: Award, title: 'Achievements', desc: 'Unlock badges and milestones as you hit your goals and maintain streaks.' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-gray-800 rounded-2xl p-6 bg-gray-900/30 hover:bg-gray-900/50 hover:border-gray-700 transition group"
                >
                  <feature.icon className="mb-4 text-gray-400 group-hover:text-white transition" size={32} />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center border border-gray-800 rounded-3xl p-12 bg-gradient-to-br from-gray-900 to-black"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to sync up?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of users tracking their progress together. Start for free, no credit card required.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLoginModal(true)}
              className="px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-2xl inline-flex items-center"
            >
              Get Started Free <ArrowRight className="ml-2" size={20} />
            </motion.button>
          </motion.div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="py-20 px-4 border-t border-gray-800 bg-gray-900/30">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-gray-400 mb-8">
              Have questions? Want to collaborate? We'd love to hear from you.
            </p>
            <a 
              href="mailto:admin@goonsync.com" 
              className="inline-flex items-center text-lg hover:text-gray-300 transition group"
            >
              <div className="h-12 w-12 bg-gray-800 rounded-full flex items-center justify-center mr-3 group-hover:bg-gray-700 transition">
                <Mail size={20} />
              </div>
              <span>admin@goonsync.com</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
              <span className="font-bold">GoonSync</span>
            </div>
            <div className="text-gray-500 text-sm">© 2024 GoonSync. All rights reserved.</div>
          </div>
        </footer>

        {/* Enhanced Login Modal */}
        <AnimatePresence>
          {showLoginModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowLoginModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-gray-800 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {isLogin ? 'Welcome back' : 'Create account'}
                  </h2>
                  <button 
                    onClick={() => { setShowLoginModal(false); setAuthError(''); }} 
                    className="text-gray-400 hover:text-white transition"
                  >
                    <CloseIcon size={24} />
                  </button>
                </div>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                  >
                    {authError}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Username or Email</label>
                    <input
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition text-white"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition text-white"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAuth}
                    disabled={loading}
                    className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : (isLogin ? 'Log in' : 'Sign up')}
                  </motion.button>

                  <button
                    onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}
                    className="w-full text-gray-400 hover:text-white transition text-sm"
                  >
                    {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Logged in views with MainLayout
  if (user && profile) {
    return (
      <MainLayout 
        currentView={view} 
        setView={setView} 
        profile={profile}
        onLogout={handleLogout}
      >
        {/* Error/Success Toast */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50 max-w-md"
            >
              <div className={`p-4 rounded-xl border ${
                authError.includes('created') || authError.includes('Joined') || authError.includes('success') || authError.includes('copied')
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              }`}>
                {authError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {view === 'dashboard' && (
          <Dashboard
            user={user}
            profile={profile}
            isSyncing={isSyncing}
            elapsedTime={elapsedTime}
            onStartSync={startSync}
            onStopSync={stopSync}
            circles={circles}
            sessions={sessions}
            activeUsers={activeUsers}
            analytics={analytics}
          />
        )}

        {view === 'profile' && (
          <ProfileView
            user={user}
            profile={profile}
            sessions={sessions}
            circles={circles}
            onLogout={handleLogout}
            supabase={supabase}
            onProfileUpdate={() => loadProfile(user.id)}
          />
        )}

        {view === 'circles' && (
          <CirclesView
            user={user}
            profile={profile}
            circles={circles}
            onCreateCircle={async (name) => {
              try {
                const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
                const { data: circleData, error: circleError } = await supabase
                  .from('circles')
                  .insert([{ name, invite_code: inviteCode, created_by: user.id }])
                  .select()
                  .single();

                if (circleError) throw circleError;

                const { error: memberError } = await supabase.from('circle_members').insert([{ 
                  circle_id: circleData.id, 
                  user_id: user.id, 
                  username: profile.username 
                }]);

                if (memberError) {
                  console.error('Failed to add member:', memberError);
                  throw memberError;
                }

                await loadCircles();
                setAuthError(`Circle created! Code: ${inviteCode}`);
                setTimeout(() => setAuthError(''), 5000);
                return { success: true, message: `Circle created! Code: ${inviteCode}` };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }}
            onJoinCircle={async (code) => {
              try {
                const { data: circleData, error: findError } = await supabase
                  .from('circles')
                  .select('*')
                  .eq('invite_code', code.toUpperCase())
                  .single();

                if (findError || !circleData) {
                  return { success: false, error: 'Invalid invite code' };
                }

                const { data: members } = await supabase
                  .from('circle_members')
                  .select('*')
                  .eq('circle_id', circleData.id);

                if (members && members.length >= 6) {
                  return { success: false, error: 'Circle is full (max 6 members)' };
                }

                const { data: existing } = await supabase
                  .from('circle_members')
                  .select('*')
                  .eq('circle_id', circleData.id)
                  .eq('user_id', user.id)
                  .single();

                if (existing) {
                  return { success: false, error: 'Already in this circle' };
                }

                if (circles.length >= 3) {
                  return { success: false, error: 'Maximum 3 circles on free tier' };
                }

                await supabase.from('circle_members').insert([{ 
                  circle_id: circleData.id, 
                  user_id: user.id, 
                  username: profile.username 
                }]);

                loadCircles();
                setAuthError(`Joined ${circleData.name}!`);
                setTimeout(() => setAuthError(''), 3000);
                return { success: true, message: `Joined ${circleData.name}!` };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }}
            onLeaveCircle={async (circleId) => {
              try {
                await supabase
                  .from('circle_members')
                  .delete()
                  .eq('circle_id', circleId)
                  .eq('user_id', user.id);

                loadCircles();
                setAuthError('Left circle successfully');
                setTimeout(() => setAuthError(''), 3000);
                return { success: true, message: 'Left circle successfully' };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }}
            supabase={supabase}
            onUpdate={loadCircles}
          />
        )}

        {view === 'leaderboard' && (
          <div className="min-h-screen">
            <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-x-border z-10">
              <div className="px-4 py-4">
                <h2 className="text-xl font-bold">Leaderboards</h2>
                <p className="text-x-gray text-sm">Compete with your circles</p>
              </div>
            </div>

            <div className="p-4">
              {circles.length === 0 ? (
                <div className="border border-x-border rounded-2xl p-12 text-center">
                  <Trophy size={48} className="mx-auto mb-4 text-x-gray" />
                  <p className="text-x-gray">Join a circle to see leaderboards</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {circles.map(circle => (
                    <div key={circle.id} className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                          </div>
                          <h3 className="font-bold text-lg">{circle.name}</h3>
                        </div>
                        <Button 
                          onClick={() => loadLeaderboard(circle.id)}
                          size="sm"
                          variant="secondary"
                        >
                          Refresh
                        </Button>
                      </div>
                      {leaderboard.length === 0 ? (
                        <p className="text-x-gray text-sm text-center py-4">No sessions yet in this circle</p>
                      ) : (
                        <div className="space-y-2">
                          {leaderboard.map((u, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`flex items-center justify-between p-4 rounded-xl transition ${
                                u.username === profile?.username 
                                  ? 'bg-x-blue/10 border-2 border-x-blue' 
                                  : 'bg-black border border-x-border hover:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="text-2xl w-10 text-center font-bold">
                                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                </div>
                                <div>
                                  <p className="font-semibold flex items-center space-x-2">
                                    <span>{u.username}</span>
                                    {u.username === profile?.username && (
                                      <span className="text-xs px-2 py-0.5 bg-x-blue/20 text-x-blue rounded">You</span>
                                    )}
                                  </p>
                                  <p className="text-x-gray text-sm">{u.totalSessions} sessions</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{formatTime(u.totalTime)}</p>
                                <p className="text-x-gray text-xs">Total time</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'analytics' && (
          <div className="min-h-screen">
            <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-x-border z-10">
              <div className="px-4 py-4">
                <h2 className="text-xl font-bold">Analytics</h2>
                <p className="text-x-gray text-sm">Track your performance</p>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-x-border rounded-2xl p-5 bg-gradient-to-br from-blue-500/5 to-blue-500/0"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock size={18} className="text-blue-500" />
                    <h3 className="text-sm text-x-gray">Total Time</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatTime(analytics.totalTime)}</p>
                  <p className="text-x-gray text-xs">All sessions</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border border-x-border rounded-2xl p-5 bg-gradient-to-br from-purple-500/5 to-purple-500/0"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp size={18} className="text-purple-500" />
                    <h3 className="text-sm text-x-gray">Average</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatTime(Math.floor(analytics.avgDuration))}</p>
                  <p className="text-x-gray text-xs">Per session</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border border-x-border rounded-2xl p-5 bg-gradient-to-br from-green-500/5 to-green-500/0"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Users size={18} className="text-green-500" />
                    <h3 className="text-sm text-x-gray">Sessions</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{analytics.totalSessions}</p>
                  <p className="text-x-gray text-xs">Completed</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border border-x-border rounded-2xl p-5 bg-gradient-to-br from-yellow-500/5 to-yellow-500/0"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Trophy size={18} className="text-yellow-500" />
                    <h3 className="text-sm text-x-gray">Best</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatTime(analytics.longestSession)}</p>
                  <p className="text-x-gray text-xs">Record</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border border-x-border rounded-2xl p-5 mb-4 bg-gray-900/30"
              >
                <h3 className="font-bold mb-4 flex items-center space-x-2">
                  <TrendingUp size={20} className="text-x-blue" />
                  <span>Activity Overview</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b border-x-border">
                    <span className="text-x-gray text-sm">Total Sessions</span>
                    <span className="font-semibold">{analytics.totalSessions}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-x-border">
                    <span className="text-x-gray text-sm">Avg Duration</span>
                    <span className="font-semibold">{formatTime(Math.floor(analytics.avgDuration))}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-x-border">
                    <span className="text-x-gray text-sm">Circles Joined</span>
                    <span className="font-semibold">{circles.length}/3</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-x-gray text-sm">Active Now</span>
                    <span className="font-semibold text-green-500">{activeUsers.length}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-2xl p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="text-yellow-500" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2 text-lg">Upgrade to Premium</h3>
                    <p className="text-x-gray mb-4 text-sm leading-relaxed">
                      Unlock unlimited circles, advanced achievements, detailed analytics, and exclusive features
                    </p>
                    <button className="px-6 py-2.5 bg-yellow-500 text-black rounded-full font-semibold hover:bg-yellow-400 transition text-sm shadow-lg">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="min-h-screen">
            <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-x-border z-10">
              <div className="px-4 py-4">
                <h2 className="text-xl font-bold">History</h2>
                <p className="text-x-gray text-sm">{sessions.filter(s => s.duration_seconds).length} completed sessions</p>
              </div>
            </div>

            <div className="p-4">
              {sessions.filter(s => s.duration_seconds).length === 0 ? (
                <div className="border border-x-border rounded-2xl p-12 text-center">
                  <History size={48} className="mx-auto mb-4 text-x-gray" />
                  <p className="text-x-gray text-lg mb-2">No sessions yet</p>
                  <p className="text-x-gray text-sm">Start your first sync to see it here!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.filter(s => s.duration_seconds).map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border border-x-border rounded-xl p-4 hover:bg-x-hover transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition">
                            <Clock size={20} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{formatTime(session.duration_seconds)}</p>
                            <p className="text-x-gray text-sm">
                              {new Date(session.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {session.circle_id && (
                            <div className="flex items-center justify-end space-x-1 text-x-gray text-sm mb-1">
                              <Users size={14} />
                              <span>Circle</span>
                            </div>
                          )}
                          <Clock size={16} className="text-x-gray ml-auto" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <Settings
            user={user}
            profile={profile}
            onLogout={handleLogout}
            supabase={supabase}
            onUpdate={() => loadProfile(user.id)}
          />
        )}
      </MainLayout>
    );
  }

  return null;
};

export default App;
