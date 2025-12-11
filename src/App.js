import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import EnhancedLanding from './components/EnhancedLanding';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import ProfileView from './components/ProfileView';
import CirclesView from './components/CirclesView';
import AchievementsView from './components/AchievementsView';
import Settings from './components/Settings';
import LevelUpAnimation from './components/LevelUpAnimation';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to trigger level up animation (can be called from anywhere in the app)
  const triggerLevelUp = (level) => {
    setNewLevel(level);
    setShowLevelUp(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="text-white text-xl">Loading GoonSync...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={session ? <Navigate to="/dashboard" /> : <EnhancedLanding />} 
          />

          {/* Protected routes */}
          {session ? (
            <Route path="/" element={<MainLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile/:username" element={<ProfileView />} />
              <Route path="circles" element={<CirclesView />} />
              <Route path="achievements" element={<AchievementsView />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>

        {/* Level Up Animation Overlay */}
        <LevelUpAnimation
          newLevel={newLevel}
          isVisible={showLevelUp}
          onComplete={() => setShowLevelUp(false)}
        />
      </Router>
    </div>
  );
}

export default App;
