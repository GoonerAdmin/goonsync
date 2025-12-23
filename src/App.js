// GoonSync App.js - Complete Rebuild with API Proxy Support
// This version routes ALL requests through /api/* endpoints for school WiFi compatibility

import React, { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp, History, Trophy, Crown, Plus, Link2, Play, Square, Mail, ArrowRight, Menu, X as CloseIcon, Sparkles, Zap, Target, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import ProfileView from './components/ProfileView';
import CirclesView from './components/CirclesView';
import Settings from './components/Settings';
import Button from './components/Button';

// CRITICAL: Import API client instead of Supabase
import { apiClient } from './utils/apiClient';

// Achievement system imports
import AchievementNotification, { LevelUpNotification } from './components/AchievementNotification';
import AchievementsPage from './pages/AchievementsPage';
import XPBar from './components/XPBar';
import { createAchievementChecker } from './utils/achievementChecker';

// Enhanced landing page import
import { EnhancedLanding } from './components/EnhancedLanding';

const App = () => {
  // ============================================================================
  // STATE DECLARATIONS
  // ============================================================================
  
  // Core state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(true);
  
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

  // Achievement system state - CRITICAL: Pass apiClient, not supabase
  const [achievementChecker] = useState(() => createAchievementChecker(apiClient));
  const [userXP, setUserXP] = useState({ total_xp: 0, current_level: 1 });
  const [newAchievements, setNewAchievements] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(null);

  // ============================================================================
  // INITIALIZATION - Check for existing session
  // ============================================================================
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get existing session from API
        const { data } = await apiClient.auth.getSession();
        
        if (data?.session?.user) {
          setUser(data.session.user);
          await loadProfile(data.session.user.id);
          await loadUserXP(data.session.user.id);
          setView('dashboard');
        } else {
          setView('landing');
        }
      } catch (error) {
        console.error('Session check error:', error);
        setView('landing');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ============================================================================
  // DATA LOADING FUNCTIONS - All use apiClient
  // ============================================================================

  // Load user profile from database
  const loadProfile = async (userId) => {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await apiClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (data) {
          setProfile(data);
          return data;
        }
        
        if (error && !error.message.includes('No rows')) {
          console.error('Profile load error:', error);
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        attempts++;
      }
    }
    
    // If profile doesn't exist after retries, create it
    try {
      console.log('Creating new profile for user:', userId);
      const newUsername = `user_${userId.substring(0, 8)}`;
      
      const { data: newProfile } = await apiClient
        .from('profiles')
        .insert([{ 
          id: userId, 
          username: newUsername, 
          avatar_url: null 
        }])
        .select()
        .single();
      
      if (newProfile) {
        setProfile(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error('Profile creation error:', error);
    }
    
    return null;
  };

  // Load user XP data
  const loadUserXP = async (userId) => {
    try {
      const xpData = await achievementChecker.getUserXP(userId);
      setUserXP(xpData);
    } catch (error) {
      console.error('Failed to load XP:', error);
    }
  };

  // Load user's circles
  const loadCircles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await apiClient
        .from('circle_members')
        .select('circle_id, circles(id, name, invite_code, created_by, created_at)')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Failed to load circles:', error);
        return;
      }
      
      if (data) {
        const circlesList = data.map(item => item.circles).filter(Boolean);
        setCircles(circlesList);
      }
    } catch (error) {
      console.error('Circles fetch error:', error);
    }
  };

  // Load user's sessions
  const loadSessions = async () => {
    if (!user) return;
    
    try {
      const { data } = await apiClient
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setSessions(data);
    } catch (error) {
      console.error('Sessions fetch error:', error);
    }
  };

  // Load active users in circles
  const loadActiveUsers = async () => {
    if (!user || circles.length === 0) return;
    
    try {
      const circleIds = circles.map(c => c.id);
      const { data } = await apiClient
        .from('active_syncs')
        .select('user_id, username, circle_id')
        .in('circle_id', circleIds);
      
      if (data) setActiveUsers(data);
    } catch (error) {
      console.error('Active users fetch error:', error);
    }
  };

  // Load leaderboard for a circle
  const loadLeaderboard = async (circleId) => {
    try {
      const { data } = await apiClient
        .from('sessions')
        .select('user_id, username, duration_seconds')
        .eq('circle_id', circleId);
      
      if (data) {
        // Aggregate times by username
        const userTimes = data.reduce((acc, session) => {
          const username = session.username || 'Unknown';
          if (!acc[username]) acc[username] = 0;
          acc[username] += session.duration_seconds || 0;
          return acc;
        }, {});
        
        // Convert to array and sort
        const sorted = Object.entries(userTimes)
          .map(([username, totalSeconds]) => ({ username, totalSeconds }))
          .sort((a, b) => b.totalSeconds - a.totalSeconds);
        
        setLeaderboard(sorted);
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
    }
  };

  // ============================================================================
  // DATA LOADING EFFECTS
  // ============================================================================

  // Load circles and sessions when user logs in
  useEffect(() => { 
    if (user) { 
      loadCircles(); 
      loadSessions(); 
    } 
  }, [user, view]);

  // Load active users when circles change
  useEffect(() => { 
    if (circles.length > 0) {
      loadActiveUsers(); 
    }
  }, [circles]);

  // ============================================================================
  // SESSION TIMER
  // ============================================================================

  useEffect(() => {
    if (!isSyncing || !syncStartTime) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - syncStartTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isSyncing, syncStartTime]);

  // ============================================================================
  // AUTHENTICATION HANDLERS
  // ============================================================================

  // Handle login - called from landing page
  const handleLogin = async (username, password) => {
    try {
      const { data, error } = await apiClient.auth.signInWithPassword({ 
        email: `${username}@goonsync.com`, 
        password 
      });
      
      if (error) throw error;
      
      if (data?.user) {
        setUser(data.user);
        await loadProfile(data.user.id);
        await loadUserXP(data.user.id);
        setView('dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  // Handle signup - called from landing page
  const handleSignup = async (username, password) => {
    try {
      const { data, error } = await apiClient.auth.signUp({ 
        email: `${username}@goonsync.com`, 
        password 
      });
      
      if (error) throw error;
      
      if (data?.user) {
        setUser(data.user);
        // Wait for database triggers to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadProfile(data.user.id);
        await loadUserXP(data.user.id);
        setView('dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiClient.auth.signOut();
      setUser(null);
      setProfile(null);
      setView('landing');
      setSessions([]);
      setCircles([]);
      setActiveUsers([]);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
      setProfile(null);
      setView('landing');
    }
  };

  // ============================================================================
  // SESSION TRACKING
  // ============================================================================

  // Start a sync session
  const startSync = async () => {
    if (!user || !profile) return;
    
    try {
      const now = Date.now();
      setSyncStartTime(now);
      setIsSyncing(true);
      setElapsedTime(0);

      const selectedCircle = circles.length > 0 ? circles[0] : null;
      
      // Create session record
      const { data: sessionData } = await apiClient
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

      // Add to active syncs
      await apiClient
        .from('active_syncs')
        .insert([{
          user_id: user.id,
          username: profile.username,
          circle_id: selectedCircle?.id || null
        }]);
      
      loadActiveUsers();
    } catch (error) {
      console.error('Start sync error:', error);
      setIsSyncing(false);
    }
  };

  // Stop sync session and process achievements
  const stopSync = async () => {
    const duration = elapsedTime;
    const sessionId = currentSessionId;
    
    // IMMEDIATELY update UI - don't make user wait!
    setIsSyncing(false); 
    setSyncStartTime(null); 
    setElapsedTime(0); 
    setCurrentSessionId(null);
    
    // Do all the database work in the background
    (async () => {
      try {
        if (sessionId) {
          // Update session with end time and duration
          await apiClient
            .from('sessions')
            .update({ 
              end_time: new Date().toISOString(), 
              duration_seconds: duration 
            })
            .eq('id', sessionId);
          
          // Calculate and award session XP
          const sessionXP = achievementChecker.calculateSessionXP(duration);
          await achievementChecker.awardXP(user.id, sessionXP);
          
          // Get completed session data
          const { data: completedSession } = await apiClient
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .single();
          
          // Update user stats
          if (completedSession) {
            await achievementChecker.updateStatsAfterSession(user.id, completedSession);
          }
          
          // Check for new achievements
          try {
            const { newAchievements: unlockedAchievements } = await achievementChecker.checkAndAwardAchievements(user.id);
            
            // Show achievement notifications
            if (unlockedAchievements && unlockedAchievements.length > 0) {
              setNewAchievements(unlockedAchievements);
              setTimeout(() => setNewAchievements([]), 5000);
            }
          } catch (error) {
            console.log('Achievement check skipped:', error.message);
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
        
        // Remove from active syncs
        await apiClient
          .from('active_syncs')
          .delete()
          .eq('user_id', user.id);
        
        // Reload data
        loadSessions(); 
        loadActiveUsers();
      } catch (error) {
        console.error('Background sync processing error:', error);
      }
    })();
  };

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  const getAnalytics = () => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.duration_seconds);
    const totalTime = completedSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    const avgDuration = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;
    const longestSession = completedSessions.length > 0 
      ? Math.max(...completedSessions.map(s => s.duration_seconds || 0)) 
      : 0;
    
    return { totalSessions, totalTime, avgDuration, longestSession };
  };

  const analytics = user ? getAnalytics() : null;

  // ============================================================================
  // CIRCLE OPERATIONS
  // ============================================================================

  // Create a new circle
  const handleCreateCircle = async (name) => {
    try {
      // CHECK: User can only create/join 3 circles max
      if (circles.length >= 3) {
        return {
          success: false,
          error: 'You can only be in 3 circles maximum. Leave a circle to create a new one.'
        };
      }

      const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Create circle
      const { data: circleData, error: circleError } = await apiClient
        .from('circles')
        .insert([{ 
          name, 
          invite_code: inviteCode, 
          created_by: user.id 
        }])
        .select()
        .single();

      if (circleError) throw circleError;

      // Add creator as member
      const { error: memberError } = await apiClient
        .from('circle_members')
        .insert([{ 
          circle_id: circleData.id, 
          user_id: user.id, 
          username: profile.username 
        }]);

      if (memberError) throw memberError;

      // Wait for database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload circles
      await loadCircles();
      
      return { 
        success: true, 
        message: `Circle created! Code: ${inviteCode}` 
      };
    } catch (error) {
      console.error('Create circle error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create circle' 
      };
    }
  };

  // Join a circle with invite code
  const handleJoinCircle = async (code) => {
    try {
      // CHECK: User can only create/join 3 circles max
      if (circles.length >= 3) {
        return {
          success: false,
          error: 'You can only be in 3 circles maximum. Leave a circle to join a new one.'
        };
      }

      // Find circle by invite code
      const { data: circle, error: findError } = await apiClient
        .from('circles')
        .select('*')
        .eq('invite_code', code.toUpperCase())
        .single();
      
      if (findError || !circle) {
        return { 
          success: false, 
          error: 'Invalid invite code' 
        };
      }

      // Add user as member
      const { error: joinError } = await apiClient
        .from('circle_members')
        .insert([{ 
          circle_id: circle.id, 
          user_id: user.id, 
          username: profile.username 
        }]);
      
      if (joinError) {
        if (joinError.message?.includes('duplicate')) {
          return { 
            success: false, 
            error: 'Already a member of this circle' 
          };
        }
        throw joinError;
      }
      
      // Reload circles
      await loadCircles();
      
      return { 
        success: true, 
        message: `Joined ${circle.name}!` 
      };
    } catch (error) {
      console.error('Join circle error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to join circle' 
      };
    }
  };

  // ============================================================================
  // LOADING SCREEN
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading GoonSync...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      {/* ========================================================================
          GLOBAL NOTIFICATIONS - Always rendered
          ======================================================================== */}
      
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

      {/* ========================================================================
          LANDING PAGE
          ======================================================================== */}
      
      {view === 'landing' && (
        <EnhancedLanding 
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      )}

      {/* ========================================================================
          MAIN APP (Dashboard and other views)
          ======================================================================== */}
      
      {view !== 'landing' && (
        <MainLayout 
          view={view} 
          setView={setView} 
          user={user}
          profile={profile}
        >
          {/* DASHBOARD VIEW */}
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
              supabase={apiClient}
            >
              <div className="p-4">
                <XPBar 
                  totalXP={userXP.total_xp} 
                  currentLevel={userXP.current_level} 
                />
              </div>
            </Dashboard>
          )}

          {/* ANALYTICS VIEW */}
          {view === 'analytics' && (
            <div className="min-h-screen pb-20">
              <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10 px-4 py-4">
                <h2 className="text-2xl font-bold flex items-center space-x-2 text-white">
                  <TrendingUp size={24} className="text-blue-500" />
                  <span>Analytics</span>
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30">
                    <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
                    <p className="text-3xl font-bold text-white">
                      {analytics?.totalSessions || 0}
                    </p>
                  </div>
                  <div className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30">
                    <p className="text-gray-400 text-sm mb-1">Total Time</p>
                    <p className="text-3xl font-bold text-white">
                      {Math.floor((analytics?.totalTime || 0) / 3600)}h{' '}
                      {Math.floor(((analytics?.totalTime || 0) % 3600) / 60)}m
                    </p>
                  </div>
                  <div className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30">
                    <p className="text-gray-400 text-sm mb-1">Avg Duration</p>
                    <p className="text-3xl font-bold text-white">
                      {Math.floor((analytics?.avgDuration || 0) / 60)}m
                    </p>
                  </div>
                  <div className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30">
                    <p className="text-gray-400 text-sm mb-1">Longest</p>
                    <p className="text-3xl font-bold text-white">
                      {Math.floor((analytics?.longestSession || 0) / 60)}m
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY VIEW */}
          {view === 'history' && (
            <div className="min-h-screen pb-20">
              <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10 px-4 py-4">
                <h2 className="text-2xl font-bold flex items-center space-x-2 text-white">
                  <History size={24} className="text-blue-500" />
                  <span>History</span>
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {sessions.length === 0 ? (
                  <div className="border border-gray-800 rounded-2xl p-12 text-center">
                    <Clock size={48} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No sessions yet</p>
                  </div>
                ) : (
                  sessions.map(session => (
                    <div 
                      key={session.id} 
                      className="border border-gray-800 rounded-2xl p-5 bg-gray-900/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(session.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-white">
                            {Math.floor((session.duration_seconds || 0) / 60)}m
                          </p>
                          <p className="text-xs text-gray-400">
                            {session.duration_seconds || 0}s
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CIRCLES VIEW */}
          {view === 'circles' && (
            <CirclesView
              user={user}
              profile={profile}
              circles={circles}
              onCreateCircle={handleCreateCircle}
              onJoinCircle={handleJoinCircle}
              leaderboard={leaderboard}
              onLoadLeaderboard={loadLeaderboard}
              supabase={apiClient}
            />
          )}

          {/* ACHIEVEMENTS VIEW */}
          {view === 'achievements' && (
            <AchievementsPage
              user={user}
              supabase={apiClient}
            />
          )}

          {/* PROFILE VIEW */}
          {view === 'profile' && (
            <ProfileView
              user={user}
              profile={profile}
              onLogout={handleLogout}
              supabase={apiClient}
              onProfileUpdate={() => loadProfile(user.id)}
            />
          )}
        </MainLayout>
      )}
    </>
  );
};

export default App;
