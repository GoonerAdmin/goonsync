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

// Achievement system imports
import AchievementNotification, { LevelUpNotification } from './components/AchievementNotification';
import AchievementsPage from './pages/AchievementsPage';
import XPBar from './components/XPBar';
import { createAchievementChecker } from './utils/achievementChecker';

// Enhanced landing page import
import { EnhancedLanding } from './components/EnhancedLanding';

const App = () => {
  // Core state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // Session state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStartTime, setSyncStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  // Data state
  const [circles, setCircles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Achievement system state
  const [achievementChecker] = useState(() => createAchievementChecker(supabase));
  const [userXP, setUserXP] = useState({ total_xp: 0, current_level: 1 });
  const [newAchievements, setNewAchievements] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(null);

  // Initialize auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).then(() => {
          loadUserXP(session.user.id);
          setView('dashboard');
        });
      } else {
        setView('landing');
      }
      setLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        loadUserXP(session.user.id);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Load profile with retry logic
  const loadProfile = async (userId) => {
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
        console.error('Profile load error:', error);
        break;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Create profile manually if needed
    console.log('Profile not found after retries, creating manually...');
    const username = userId.substring(0, 8);
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert([{ id: userId, username: username, avatar_url: null }])
      .select()
      .single();
    
    if (newProfile) setProfile(newProfile);
  };

  // Load user XP
  const loadUserXP = async (userId) => {
    const xpData = await achievementChecker.getUserXP(userId);
    setUserXP(xpData);
  };

  // Load circles
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

  // Load sessions
  const loadSessions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setSessions(data);
  };

  // Load active users
  const loadActiveUsers = async () => {
    if (!user || circles.length === 0) return;
    const { data } = await supabase
      .from('active_syncs')
      .select('user_id, username, circle_id')
      .in('circle_id', circles.map(c => c.id));
    if (data) setActiveUsers(data);
  };

  // Load leaderboard
  const loadLeaderboard = async (circleId) => {
    const { data } = await supabase
      .from('sessions')
      .select('user_id, username')
      .eq('circle_id', circleId);
    
    if (data) {
      const userTimes = data.reduce((acc, s) => {
        if (!acc[s.username]) acc[s.username] = 0;
        acc[s.username] += s.duration_seconds || 0;
        return acc;
      }, {});
      const sorted = Object.entries(userTimes)
        .map(([username, totalSeconds]) => ({ username, totalSeconds }))
        .sort((a, b) => b.totalSeconds - a.totalSeconds);
      setLeaderboard(sorted);
    }
  };

  // Load data when user or view changes
  useEffect(() => { 
    if (user) { 
      loadCircles(); 
      loadSessions(); 
    } 
  }, [user, view]);

  useEffect(() => { 
    if (circles.length > 0) loadActiveUsers(); 
  }, [circles]);

  // Timer effect
  useEffect(() => {
    if (!isSyncing || !syncStartTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - syncStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSyncing, syncStartTime]);

  // Handle authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: `${username}@goonsync.com`, 
          password 
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email: `${username}@goonsync.com`, 
          password 
        });
        if (error) throw error;
        if (data.user) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await loadProfile(data.user.id);
          await loadUserXP(data.user.id);
          setView('dashboard');
        }
      }
      setShowLoginModal(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setView('landing');
  };

  // Start sync
  const startSync = async () => {
    if (!user || !profile) return;
    
    const now = Date.now();
    setSyncStartTime(now);
    setIsSyncing(true);
    setElapsedTime(0);

    const selectedCircle = circles.length > 0 ? circles[0] : null;
    
    const { data: sessionData } = await supabase
      .from('sessions')
      .insert([{
        user_id: user.id,
        username: profile.username,
        circle_id: selectedCircle?.id || null,
        start_time: new Date(now).toISOString()
      }])
      .select()
      .single();

    if (sessionData) {
      setCurrentSessionId(sessionData.id);
    }

    await supabase
      .from('active_syncs')
      .insert([{
        user_id: user.id,
        username: profile.username,
        circle_id: selectedCircle?.id || null
      }]);
    
    loadActiveUsers();
  };

  // Stop sync with achievements
  const stopSync = async () => {
    const duration = elapsedTime;
    
    if (currentSessionId) {
      // Update session
      await supabase
        .from('sessions')
        .update({ 
          end_time: new Date().toISOString(), 
          duration_seconds: duration 
        })
        .eq('id', currentSessionId);
      
      // Award session XP
      const sessionXP = achievementChecker.calculateSessionXP(duration);
      await achievementChecker.awardXP(user.id, sessionXP);
      
      // Get completed session
      const { data: completedSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', currentSessionId)
        .single();
      
      // Update stats
      if (completedSession) {
        await achievementChecker.updateStatsAfterSession(user.id, completedSession);
      }
      
      // Check achievements
      const { newAchievements: unlockedAchievements } = await achievementChecker.checkAndAwardAchievements(user.id);
      
      // Show achievement notifications
      if (unlockedAchievements.length > 0) {
        setNewAchievements(unlockedAchievements);
        setTimeout(() => setNewAchievements([]), 5000);
      }
      
      // Check for level up
      const updatedXP = await achievementChecker.getUserXP(user.id);
      if (updatedXP.current_level > userXP.current_level) {
        setShowLevelUp({ 
          oldLevel: userXP.current_level, 
          newLevel: updatedXP.current_level 
        });
        setTimeout(() => setShowLevelUp(null), 4000);
      }
      setUserXP(updatedXP);
    }
    
    await supabase.from('active_syncs').delete().eq('user_id', user.id);
    setIsSyncing(false); 
    setSyncStartTime(null); 
    setElapsedTime(0); 
    setCurrentSessionId(null);
    loadSessions(); 
    loadActiveUsers();
  };

  // Get analytics
  const getAnalytics = () => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.duration_seconds);
    const totalTime = completedSessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const avgDuration = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;
    const longestSession = completedSessions.length > 0 ? Math.max(...completedSessions.map(s => s.duration_seconds)) : 0;
    return { totalSessions, totalTime, avgDuration, longestSession };
  };

  const analytics = user ? getAnalytics() : null;

  // Loading screen
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

  // Render app with modal OUTSIDE views
  return (
    <>
      {/* Achievement Notifications - Always Available */}
      <AchievementNotification 
        achievements={newAchievements}
        onClose={() => setNewAchievements([])}
      />
      
      {showLevelUp && (
        <LevelUpNotification
          oldLevel={showLevelUp.oldLevel}
          newLevel={showLevelUp.newLevel}
          onClose={() => setShowLevelUp(null)}
        />
      )}

      {/* Login Modal - Always Available */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-x-border rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-x-blue to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center mb-2">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-gray-400 text-center mb-8">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </p>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl p-4 mb-6 text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-x-border rounded-xl text-white focus:border-x-blue focus:outline-none transition"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-x-border rounded-xl text-white focus:border-x-blue focus:outline-none transition"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-lg font-semibold"
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
              </form>

              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-center text-sm text-gray-400 hover:text-white transition mt-4"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Landing Page */}
      {view === 'landing' && (
        <EnhancedLanding 
          supabase={supabase}
          onGetStarted={() => setShowLoginModal(true)}
        />
      )}

      {/* Main App with MainLayout */}
      {view !== 'landing' && (
        <MainLayout 
          view={view} 
          setView={setView} 
          user={user}
          profile={profile}
        >
          {/* Dashboard */}
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
            >
              <div className="p-4">
                <XPBar totalXP={userXP.total_xp} currentLevel={userXP.current_level} />
              </div>
            </Dashboard>
          )}

          {/* Analytics */}
          {view === 'analytics' && (
            <div className="min-h-screen pb-20">
              <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-x-border z-10 px-4 py-4">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <TrendingUp size={24} className="text-x-blue" />
                  <span>Analytics</span>
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
                    <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
                    <p className="text-3xl font-bold">{analytics?.totalSessions || 0}</p>
                  </div>
                  <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
                    <p className="text-gray-400 text-sm mb-1">Total Time</p>
                    <p className="text-3xl font-bold">
                      {Math.floor((analytics?.totalTime || 0) / 3600)}h {Math.floor(((analytics?.totalTime || 0) % 3600) / 60)}m
                    </p>
                  </div>
                  <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
                    <p className="text-gray-400 text-sm mb-1">Avg Duration</p>
                    <p className="text-3xl font-bold">{Math.floor((analytics?.avgDuration || 0) / 60)}m</p>
                  </div>
                  <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
                    <p className="text-gray-400 text-sm mb-1">Longest</p>
                    <p className="text-3xl font-bold">{Math.floor((analytics?.longestSession || 0) / 60)}m</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {view === 'history' && (
            <div className="min-h-screen pb-20">
              <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-x-border z-10 px-4 py-4">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <History size={24} className="text-x-blue" />
                  <span>History</span>
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {sessions.length === 0 ? (
                  <div className="border border-x-border rounded-2xl p-12 text-center">
                    <Clock size={48} className="mx-auto mb-4 text-x-gray" />
                    <p className="text-x-gray">No sessions yet</p>
                  </div>
                ) : (
                  sessions.map(session => (
                    <div key={session.id} className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{new Date(session.created_at).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-400">{new Date(session.created_at).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{Math.floor((session.duration_seconds || 0) / 60)}m</p>
                          <p className="text-xs text-gray-400">{session.duration_seconds || 0}s</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Circles */}
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

                  const { error: memberError } = await supabase
                    .from('circle_members')
                    .insert([{ 
                      circle_id: circleData.id, 
                      user_id: user.id, 
                      username: profile.username 
                    }]);

                  if (memberError) {
                    console.error('Failed to add member:', memberError);
                    throw memberError;
                  }

                  await new Promise(resolve => setTimeout(resolve, 500));
                  await loadCircles();
                  
                  console.log('Circle created successfully');
                  setAuthError(`Circle created! Code: ${inviteCode}`);
                  setTimeout(() => setAuthError(''), 5000);
                  return { success: true, message: `Circle created! Code: ${inviteCode}` };
                } catch (error) {
                  return { success: false, error: error.message };
                }
              }}
              onJoinCircle={async (code) => {
                try {
                  const { data: circle } = await supabase
                    .from('circles')
                    .select('*')
                    .eq('invite_code', code.toUpperCase())
                    .single();
                  
                  if (!circle) return { success: false, error: 'Invalid invite code' };

                  const { error } = await supabase
                    .from('circle_members')
                    .insert([{ 
                      circle_id: circle.id, 
                      user_id: user.id, 
                      username: profile.username 
                    }]);
                  
                  if (error) return { success: false, error: error.message };
                  
                  loadCircles();
                  return { success: true, message: `Joined ${circle.name}!` };
                } catch (error) {
                  return { success: false, error: error.message };
                }
              }}
              leaderboard={leaderboard}
              onLoadLeaderboard={loadLeaderboard}
            />
          )}

          {/* Achievements */}
          {view === 'achievements' && (
            <AchievementsPage
              user={user}
              supabase={supabase}
            />
          )}

          {/* Profile */}
          {view === 'profile' && (
            <ProfileView
              user={user}
              profile={profile}
              onLogout={handleLogout}
              supabase={supabase}
              onProfileUpdate={() => loadProfile(user.id)}
            />
          )}
        </MainLayout>
      )}
    </>
  );
};

export default App;