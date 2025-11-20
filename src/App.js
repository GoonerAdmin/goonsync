import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Clock, TrendingUp, History, LogOut, Plus, Link2, Play, Square, Trophy, Crown } from 'lucide-react';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        setView('dashboard');
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
    const circleIds = circles.map(c => c.id);
    const subscription = supabase.channel('active_syncs_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'active_syncs', filter: `circle_id=in.(${circleIds.join(',')})` }, () => { loadActiveUsers(); }).subscribe();
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
      else setView('dashboard');
    } else {
      const { error } = await supabase.auth.signUp({ email: `${username}@goonsync.app`, password, options: { data: { username } } });
      if (error) alert('Signup failed: ' + error.message);
      else { alert('Account created! Logging you in...'); setView('dashboard'); }
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
    if ('Notification' in window && Notification.permission === 'granted') new Notification('GoonSync', { body: `${profile.username} is syncing now!`, icon: '🔄' });
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
      setNewCircleName(''); loadCircles(); alert(`Circle created! Invite code: ${inviteCode}`);
    }
  };

  const joinCircle = async () => {
    if (!joinCode.trim()) return;
    const { data: circleData } = await supabase.from('circles').select('*').eq('invite_code', joinCode.toUpperCase()).single();
    if (!circleData) { alert('Invalid invite code!'); return; }
    const { data: members } = await supabase.from('circle_members').select('*').eq('circle_id', circleData.id);
    if (members && members.length >= 6) { alert('Circle is full (6 max)'); return; }
    const { data: existing } = await supabase.from('circle_members').select('*').eq('circle_id', circleData.id).eq('user_id', user.id).single();
    if (existing) { alert('Already in this circle!'); return; }
    if (circles.length >= 3) { alert('Free users: 3 circles max!'); return; }
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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center"><div className="text-white text-2xl">Loading...</div></div>;const Header = () => (
    <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-3xl">🔄</div>
          <h1 className="text-2xl font-bold text-white">GoonSync</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-purple-200">@{profile?.username}</span>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition">
            <LogOut className="text-white" size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const Navigation = () => (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex gap-2 bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20">
        {['dashboard', 'circles', 'leaderboard', 'analytics', 'history'].map(v => (
          <button key={v} onClick={() => setView(v)} className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${view === v ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-white'}`}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔄</div>
            <h1 className="text-4xl font-bold text-white mb-2">GoonSync</h1>
            <p className="text-purple-200">Sync with your circle, anytime</p>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAuth()} className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <button onClick={handleAuth} disabled={loading} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition disabled:opacity-50">{isLogin ? 'Log In' : 'Sign Up'}</button>
            <button onClick={() => setIsLogin(!isLogin)} className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition border border-white/30">{isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    const otherActiveUsers = activeUsers.filter(u => u.user_id !== user.id);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header /><Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          {otherActiveUsers.length > 0 && !isSyncing && (
            <div className="bg-green-500/20 border border-green-400/40 rounded-xl p-4 mb-6 backdrop-blur-lg">
              <p className="text-green-100 text-center font-semibold">🔥 {otherActiveUsers.map(u => u.username).join(', ')} {otherActiveUsers.length === 1 ? 'is' : 'are'} syncing now! Join them!</p>
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
            {!isSyncing ? (
              <>
                <div className="mb-8"><div className="text-8xl mb-4">⚡</div><h2 className="text-4xl font-bold text-white mb-2">Ready to Sync?</h2><p className="text-purple-200">{circles.length === 0 ? 'Join a circle first!' : 'Hit the button to notify your circles'}</p></div>
                <button onClick={startSync} disabled={circles.length === 0} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-16 py-6 rounded-2xl text-2xl font-bold shadow-2xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"><Play className="inline mr-2" size={32} />SYNC NOW</button>
              </>
            ) : (
              <>
                <div className="mb-8"><div className="text-8xl mb-4 animate-pulse">🔄</div><h2 className="text-4xl font-bold text-white mb-2">Syncing...</h2><p className="text-6xl font-mono text-purple-200 my-6">{formatTime(elapsedTime)}</p></div>
                <button onClick={stopSync} className="bg-red-600 hover:bg-red-700 text-white px-16 py-6 rounded-2xl text-2xl font-bold shadow-2xl transform hover:scale-105 transition"><Square className="inline mr-2" size={32} />FINISH</button>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"><div className="text-3xl font-bold text-white">{analytics.totalSessions}</div><div className="text-purple-200 text-sm">Total Sessions</div></div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"><div className="text-3xl font-bold text-white">{formatTime(Math.floor(analytics.avgDuration))}</div><div className="text-purple-200 text-sm">Avg Duration</div></div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"><div className="text-3xl font-bold text-white">{activeUsers.length}</div><div className="text-purple-200 text-sm">Active Now</div></div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'circles') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header /><Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Your Circles ({circles.length}/3)</h2>
            {circles.length === 0 ? (
              <div className="text-center py-8 text-purple-200"><Users size={48} className="mx-auto mb-4 opacity-50" /><p>You're not in any circles yet. Create or join one!</p></div>
            ) : (
              <div className="grid gap-4 mb-8">
                {circles.map(circle => (
                  <div key={circle.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{circle.name}</h3>
                        {circle.created_by === user.id && <Crown size={20} className="text-yellow-400" />}
                      </div>
                    </div>
                    <p className="text-purple-200 text-sm mb-4">Invite Code: {circle.invite_code}</p>
                    <button onClick={() => { navigator.clipboard.writeText(circle.invite_code); alert('Copied!'); }} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"><Link2 size={16} />Copy Invite Code</button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <input type="text" placeholder="Circle name" value={newCircleName} onChange={(e) => setNewCircleName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2" />
                <button onClick={createCircle} disabled={circles.length >= 3} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"><Plus size={20} />Create New Circle</button>
                {circles.length >= 3 && <p className="text-yellow-300 text-sm mt-2 text-center">Free users: 3 circles max</p>}
              </div>
              <div>
                <input type="text" placeholder="Enter invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2" />
                <button onClick={joinCircle} disabled={circles.length >= 3} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed">Join Circle</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }if (view === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header /><Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Circle Leaderboards</h2>
            {circles.length === 0 ? (
              <div className="text-center py-12"><Trophy className="text-purple-300 mx-auto mb-4" size={48} /><p className="text-purple-200">Join a circle to see leaderboards!</p></div>
            ) : (
              <div className="space-y-6">
                {circles.map(circle => (
                  <div key={circle.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Trophy className="text-yellow-400" size={24} />{circle.name}</h3>
                    <button onClick={() => loadLeaderboard(circle.id)} className="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition">Load Leaderboard</button>
                    {leaderboard.length === 0 ? (
                      <p className="text-purple-200 text-center py-4">No sessions yet</p>
                    ) : (
                      <div className="space-y-3">
                        {leaderboard.map((u, i) => (
                          <div key={i} className={`flex items-center justify-between p-4 rounded-lg ${u.username === profile?.username ? 'bg-purple-600/30 border border-purple-400/50' : 'bg-white/5'}`}>
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
                              <div><p className="text-white font-semibold">{u.username}</p><p className="text-purple-200 text-sm">{u.totalSessions} sessions</p></div>
                            </div>
                            <div className="text-right"><p className="text-white font-bold">{formatTime(u.totalTime)}</p><p className="text-purple-200 text-sm">Total time</p></div>
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
      </div>
    );
  }

  if (view === 'analytics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header /><Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-8">Your Analytics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4"><Clock className="text-white" size={24} /><h3 className="text-xl font-bold text-white">Total Goon Time</h3></div>
                <p className="text-5xl font-bold text-white mb-2">{formatTime(analytics.totalTime)}</p>
                <p className="text-purple-200">Across all sessions</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4"><TrendingUp className="text-white" size={24} /><h3 className="text-xl font-bold text-white">Average Duration</h3></div>
                <p className="text-5xl font-bold text-white mb-2">{formatTime(Math.floor(analytics.avgDuration))}</p>
                <p className="text-purple-200">Per session</p>
              </div>
              <div className="bg-gradient-to-br from-green-600/30 to-blue-600/30 rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4"><Users className="text-white" size={24} /><h3 className="text-xl font-bold text-white">Total Sessions</h3></div>
                <p className="text-5xl font-bold text-white mb-2">{analytics.totalSessions}</p>
                <p className="text-purple-200">Completed</p>
              </div>
              <div className="bg-gradient-to-br from-pink-600/30 to-red-600/30 rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4"><Trophy className="text-white" size={24} /><h3 className="text-xl font-bold text-white">Longest Session</h3></div>
                <p className="text-5xl font-bold text-white mb-2">{formatTime(analytics.longestSession)}</p>
                <p className="text-purple-200">Personal record</p>
              </div>
            </div>
            <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Activity Insights</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-purple-200">Sessions This Week</span><span className="text-white font-bold">{analytics.totalSessions}</span></div>
                <div className="flex justify-between items-center"><span className="text-purple-200">Average Session Length</span><span className="text-white font-bold">{formatTime(Math.floor(analytics.avgDuration))}</span></div>
                <div className="flex justify-between items-center"><span className="text-purple-200">Circles Joined</span><span className="text-white font-bold">{circles.length}/3</span></div>
                <div className="flex justify-between items-center"><span className="text-purple-200">Currently Active</span><span className="text-white font-bold">{activeUsers.length} users</span></div>
              </div>
            </div>
            <div className="mt-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Crown className="text-yellow-400 flex-shrink-0" size={24} />
                <div><h3 className="text-xl font-bold text-white mb-2">Upgrade to Premium</h3><p className="text-purple-200 mb-4">Unlock unlimited circles, advanced analytics, and more!</p><button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition">Upgrade Now</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'history') {
    const completedSessions = sessions.filter(s => s.duration_seconds);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header /><Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Session History</h2>
            {completedSessions.length === 0 ? (
              <div className="text-center py-12"><History className="text-purple-300 mx-auto mb-4" size={48} /><p className="text-purple-200">No sessions yet. Start your first sync!</p></div>
            ) : (
              <div className="space-y-3">
                {completedSessions.map((session, index) => (
                  <div key={session.id} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{formatTime(session.duration_seconds)}</p>
                      <p className="text-purple-200 text-sm">{new Date(session.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-300 text-sm">Session #{completedSessions.length - index}</p>
                      <p className="text-purple-200 text-xs">{new Date(session.start_time).toLocaleTimeString()} - {new Date(session.end_time).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;