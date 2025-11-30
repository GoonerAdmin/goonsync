import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Clock, TrendingUp, History, Trophy, Crown, Plus, Link2, Play, Square, Mail, ArrowRight, Menu, X as CloseIcon } from 'lucide-react';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Button from './components/Button';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

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
  const [newCircleName, setNewCircleName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const loadCircles = async () => {
    if (!user) return;
    const { data } = await supabase.from('circle_members').select('circle_id, circles(id, name, invite_code, created_by)').eq('user_id', user.id);
    if (data) setCircles(data.map(d => d.circles));
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
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email: username.includes('@') ? username : `${username}@goonsync.com`, password });
      if (error) alert('Login failed: ' + error.message);
      else { setShowLoginModal(false); setView('dashboard'); }
    } else {
      const { error } = await supabase.auth.signUp({ email: username.includes('@') ? username : `${username}@goonsync.com`, password, options: { data: { username: username.split('@')[0] } } });
      if (error) alert('Signup failed: ' + error.message);
      else { alert('Account created!'); setShowLoginModal(false); setView('dashboard'); }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (isSyncing) await stopSync();
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setView('landing'); setUsername(''); setPassword('');
  };

  const startSync = async () => {
    if (circles.length === 0) { alert('Join a circle first!'); return; }
    const now = Date.now();
    setIsSyncing(true); setSyncStartTime(now);
    const { data: sessionData } = await supabase.from('sessions').insert([{ user_id: user.id, username: profile.username, start_time: new Date(now).toISOString(), circle_id: circles[0].id }]).select().single();
    if (sessionData) setCurrentSessionId(sessionData.id);
    for (const circle of circles) {
      await supabase.from('active_syncs').insert([{ user_id: user.id, username: profile.username, circle_id: circle.id }]);
    }
    if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
    if ('Notification' in window && Notification.permission === 'granted') new Notification('GoonSync', { body: `${profile.username} is syncing now!` });
  };

  const stopSync = async () => {
    const duration = elapsedTime;
    if (currentSessionId) await supabase.from('sessions').update({ end_time: new Date().toISOString(), duration_seconds: duration }).eq('id', currentSessionId);
    await supabase.from('active_syncs').delete().eq('user_id', user.id);
    setIsSyncing(false); setSyncStartTime(null); setElapsedTime(0); setCurrentSessionId(null);
    loadSessions(); loadActiveUsers();
  };

  const createCircle = async () => {
    if (!newCircleName.trim()) return;
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data: circleData } = await supabase.from('circles').insert([{ name: newCircleName, invite_code: inviteCode, created_by: user.id }]).select().single();
    if (circleData) {
      await supabase.from('circle_members').insert([{ circle_id: circleData.id, user_id: user.id, username: profile.username }]);
      setNewCircleName(''); loadCircles(); alert(`Circle created! Code: ${inviteCode}`);
    }
  };

  const joinCircle = async () => {
    if (!joinCode.trim()) return;
    const { data: circleData } = await supabase.from('circles').select('*').eq('invite_code', joinCode.toUpperCase()).single();
    if (!circleData) { alert('Invalid code!'); return; }
    const { data: members } = await supabase.from('circle_members').select('*').eq('circle_id', circleData.id);
    if (members && members.length >= 6) { alert('Circle full'); return; }
    const { data: existing } = await supabase.from('circle_members').select('*').eq('circle_id', circleData.id).eq('user_id', user.id).single();
    if (existing) { alert('Already in circle!'); return; }
    if (circles.length >= 3) { alert('3 circles max!'); return; }
    await supabase.from('circle_members').insert([{ circle_id: circleData.id, user_id: user.id, username: profile.username }]);
    setJoinCode(''); loadCircles(); alert('Joined!');
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white text-xl">Loading...</div></div>;

  // Landing Page (unchanged for now - will redesign later)
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="fixed w-full bg-black/90 backdrop-blur-sm border-b border-x-border z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="text-2xl font-bold">GoonSync</div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="hover:text-gray-300 transition">Features</a>
                <a href="#contact" className="hover:text-gray-300 transition">Contact</a>
                <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition">Get Started</button>
              </div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">{mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}</button>
            </div>
          </div>
        </nav>
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black z-40 pt-20 px-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl py-2">Features</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-xl py-2">Contact</a>
              <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} className="px-6 py-3 bg-white text-black rounded-full font-semibold">Get Started</button>
            </div>
          </div>
        )}
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">Sync with the squad.</h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12">Real-time coordination for your crew. Stay connected, stay synchronized.</p>
            <button onClick={() => setShowLoginModal(true)} className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105 inline-flex items-center">Try Web Version <ArrowRight className="ml-2" size={20} /></button>
          </div>
        </div>
        <div className="py-12 px-4 border-y border-x-border">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-400 mb-6">Coming Soon</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="bg-gray-900 px-8 py-3 rounded-lg border border-x-border"><p className="text-sm text-gray-500">Available on</p><p className="font-bold">App Store</p></div>
              <div className="bg-gray-900 px-8 py-3 rounded-lg border border-x-border"><p className="text-sm text-gray-500">Available on</p><p className="font-bold">Play Store</p></div>
            </div>
          </div>
        </div>
        <div id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Everything you need</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border border-x-border rounded-xl hover:border-gray-700 transition"><Users className="mb-4" size={32} /><h3 className="text-xl font-bold mb-2">Circles</h3><p className="text-gray-400">Create private groups and sync with your squad in real-time.</p></div>
              <div className="p-6 border border-x-border rounded-xl hover:border-gray-700 transition"><Trophy className="mb-4" size={32} /><h3 className="text-xl font-bold mb-2">Leaderboards</h3><p className="text-gray-400">Compete with friends and track your stats over time.</p></div>
              <div className="p-6 border border-x-border rounded-xl hover:border-gray-700 transition"><TrendingUp className="mb-4" size={32} /><h3 className="text-xl font-bold mb-2">Analytics</h3><p className="text-gray-400">Deep insights into your activity and performance.</p></div>
            </div>
          </div>
        </div>
        <div id="contact" className="py-20 px-4 border-t border-x-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Get in touch</h2>
            <p className="text-gray-400 mb-8">Have questions? Want to collaborate? Reach out to us.</p>
            <a href="mailto:admin@goonsync.com" className="inline-flex items-center text-lg hover:text-gray-300 transition"><Mail className="mr-2" size={20} />admin@goonsync.com</a>
          </div>
        </div>
        <footer className="py-8 px-4 border-t border-x-border"><div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">© 2024 GoonSync. All rights reserved.</div></footer>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-x-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create account'}</h2>
                <button onClick={() => setShowLoginModal(false)} className="hover:text-gray-400 transition"><CloseIcon size={24} /></button>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Email or username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-black border border-x-border rounded-lg focus:outline-none focus:border-gray-600 transition" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAuth()} className="w-full px-4 py-3 bg-black border border-x-border rounded-lg focus:outline-none focus:border-gray-600 transition" />
                <button onClick={handleAuth} disabled={loading} className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-50">{isLogin ? 'Log in' : 'Sign up'}</button>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full text-gray-400 hover:text-white transition text-sm">{isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged in views with new X-style layout
  if (user && profile) {
    return (
      <MainLayout 
        currentView={view} 
        setView={setView} 
        profile={profile}
        onLogout={handleLogout}
      >
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

        {view === 'circles' && (
          <div className="min-h-screen">
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-x-border z-10">
              <div className="px-4 py-3">
                <h2 className="text-xl font-bold">Circles</h2>
                <p className="text-x-gray text-sm">{circles.length}/3 circles</p>
              </div>
            </div>

            <div className="p-4">
              {circles.length === 0 ? (
                <div className="border border-x-border rounded-2xl p-12 text-center">
                  <Users size={48} className="mx-auto mb-4 text-x-gray" />
                  <p className="text-x-gray mb-2">No circles yet</p>
                  <p className="text-x-gray text-sm">Create or join one to get started</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {circles.map(circle => (
                    <div key={circle.id} className="border border-x-border rounded-2xl p-4 hover:bg-x-hover transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold">{circle.name}</h3>
                          {circle.created_by === user.id && <Crown size={16} className="text-yellow-500" />}
                        </div>
                      </div>
                      <p className="text-x-gray text-sm mb-2">Code: <span className="font-mono">{circle.invite_code}</span></p>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(circle.invite_code); alert('Copied!'); }} 
                        className="text-sm text-x-gray hover:text-x-blue transition inline-flex items-center"
                      >
                        <Link2 size={14} className="mr-1" /> Copy code
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <div className="border border-x-border rounded-2xl p-4">
                  <h3 className="font-bold mb-3">Create Circle</h3>
                  <input 
                    type="text" 
                    placeholder="Circle name" 
                    value={newCircleName} 
                    onChange={(e) => setNewCircleName(e.target.value)} 
                    className="w-full px-4 py-3 bg-black border border-x-border rounded-xl focus:outline-none focus:border-x-blue mb-3 transition" 
                  />
                  <Button 
                    onClick={createCircle} 
                    disabled={circles.length >= 3}
                    variant="primary"
                    className="w-full"
                    icon={Plus}
                  >
                    Create Circle
                  </Button>
                  {circles.length >= 3 && <p className="text-yellow-500 text-sm mt-2">Free tier: 3 circles max</p>}
                </div>

                <div className="border border-x-border rounded-2xl p-4">
                  <h3 className="font-bold mb-3">Join Circle</h3>
                  <input 
                    type="text" 
                    placeholder="Enter invite code" 
                    value={joinCode} 
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
                    className="w-full px-4 py-3 bg-black border border-x-border rounded-xl focus:outline-none focus:border-x-blue mb-3 transition font-mono" 
                  />
                  <Button 
                    onClick={joinCircle} 
                    disabled={circles.length >= 3}
                    variant="secondary"
                    className="w-full"
                  >
                    Join Circle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'leaderboard' && (
          <div className="min-h-screen">
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-x-border z-10">
              <div className="px-4 py-3">
                <h2 className="text-xl font-bold">Leaderboards</h2>
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
                    <div key={circle.id} className="border border-x-border rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">{circle.name}</h3>
                        <Button 
                          onClick={() => loadLeaderboard(circle.id)}
                          size="sm"
                          variant="secondary"
                        >
                          Load
                        </Button>
                      </div>
                      {leaderboard.length === 0 ? (
                        <p className="text-x-gray text-sm">No sessions yet</p>
                      ) : (
                        <div className="space-y-2">
                          {leaderboard.map((u, i) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${u.username === profile?.username ? 'bg-x-hover border border-x-border' : 'bg-black'}`}>
                              <div className="flex items-center space-x-3">
                                <div className="text-lg w-8">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</div>
                                <div>
                                  <p className="font-semibold">{u.username}</p>
                                  <p className="text-x-gray text-sm">{u.totalSessions} sessions</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{formatTime(u.totalTime)}</p>
                                <p className="text-x-gray text-xs">Total</p>
                              </div>
                            </div>
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
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-x-border z-10">
              <div className="px-4 py-3">
                <h2 className="text-xl font-bold">Analytics</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="border border-x-border rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock size={18} className="text-x-gray" />
                    <h3 className="text-sm text-x-gray">Total Time</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatTime(analytics.totalTime)}</p>
                  <p className="text-x-gray text-xs">All sessions</p>
                </div>

                <div className="border border-x-border rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp size={18} className="text-x-gray" />
                    <h3 className="text-sm text-x-gray">Average</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatTime(Math.floor(analytics.avgDuration))}</p>
                  <p className="text-x-gray text-xs">Per session</p>
                </div>

                <div className="border border-x-border rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users size={18} className="text-x-gray" />
                    <h3 className="text-sm text-x-gray">Sessions</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{analytics.totalSessions}</p>
                  <p className="text-x-gray text-xs">Completed</p>
                </div>

                <div className="border border-x-border rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Trophy size={18} className="text-x-gray" />
                    <h3 className="text-sm text-x-gray">Best</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatTime(analytics.longestSession)}</p>
                  <p className="text-x-gray text-xs">Record</p>
                </div>
              </div>

              <div className="border border-x-border rounded-2xl p-4 mb-4">
                <h3 className="font-bold mb-3">Activity Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-x-border">
                    <span className="text-x-gray text-sm">Total Sessions</span>
                    <span className="font-semibold">{analytics.totalSessions}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-x-border">
                    <span className="text-x-gray text-sm">Avg Duration</span>
                    <span className="font-semibold">{formatTime(Math.floor(analytics.avgDuration))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-x-border">
                    <span className="text-x-gray text-sm">Circles Joined</span>
                    <span className="font-semibold">{circles.length}/3</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-x-gray text-sm">Active Now</span>
                    <span className="font-semibold">{activeUsers.length}</span>
                  </div>
                </div>
              </div>

              <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <Crown className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold mb-2">Upgrade to Premium</h3>
                    <p className="text-x-gray mb-4 text-sm">Unlock unlimited circles, achievements, and advanced analytics</p>
                    <button className="px-6 py-2 bg-yellow-500 text-black rounded-full font-semibold hover:bg-yellow-400 transition text-sm">Coming Soon</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="min-h-screen">
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-x-border z-10">
              <div className="px-4 py-3">
                <h2 className="text-xl font-bold">History</h2>
              </div>
            </div>

            <div className="p-4">
              {sessions.filter(s => s.duration_seconds).length === 0 ? (
                <div className="border border-x-border rounded-2xl p-12 text-center">
                  <History size={48} className="mx-auto mb-4 text-x-gray" />
                  <p className="text-x-gray">No sessions yet</p>
                  <p className="text-x-gray text-sm mt-1">Start your first sync!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.filter(s => s.duration_seconds).map((session) => (
                    <div key={session.id} className="border border-x-border rounded-xl p-4 hover:bg-x-hover transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-lg">{formatTime(session.duration_seconds)}</p>
                          <p className="text-x-gray text-sm">{new Date(session.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <Clock size={18} className="text-x-gray ml-auto mb-1" />
                          <p className="text-x-gray text-xs">{new Date(session.start_time).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </MainLayout>
    );
  }

  return null;
};

export default App;