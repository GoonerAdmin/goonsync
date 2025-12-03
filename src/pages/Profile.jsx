import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User, Clock, TrendingUp, Users, Calendar, Award, Settings, LogOut } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    avgDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    thisWeekSessions: 0,
    thisMonthSessions: 0
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setUser(user);

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // Get all sessions
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      setSessions(sessionsData || []);

      // Get user's circles
      const { data: circlesData } = await supabase
        .from('circle_members')
        .select(`
          circles (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq('user_id', user.id);
      setCircles(circlesData?.map(item => item.circles) || []);

      // Calculate stats
      if (sessionsData && sessionsData.length > 0) {
        calculateStats(sessionsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (sessionsData) => {
    // Filter completed sessions only
    const completedSessions = sessionsData.filter(s => s.end_time && s.duration_seconds);
    
    const totalSessions = completedSessions.length;
    const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    // Calculate this week's sessions
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekSessions = completedSessions.filter(s => 
      new Date(s.start_time) >= weekAgo
    ).length;

    // Calculate this month's sessions
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const thisMonthSessions = completedSessions.filter(s => 
      new Date(s.start_time) >= monthAgo
    ).length;

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(completedSessions);

    setStats({
      totalSessions,
      totalDuration,
      avgDuration,
      currentStreak,
      longestStreak,
      thisWeekSessions,
      thisMonthSessions
    });
  };

  const calculateStreaks = (sessionsData) => {
    if (sessionsData.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Sort by date
    const sorted = [...sessionsData].sort((a, b) => 
      new Date(a.start_time) - new Date(b.start_time)
    );

    // Get unique days
    const days = new Set(sorted.map(s => 
      new Date(s.start_time).toDateString()
    ));
    const uniqueDays = Array.from(days).sort((a, b) => 
      new Date(a) - new Date(b)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Calculate streaks
    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDay = new Date(uniqueDays[i - 1]);
      const currDay = new Date(uniqueDays[i]);
      const diffDays = Math.floor((currDay - prevDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Check if current streak is active (last session was yesterday or today)
    const lastDay = new Date(uniqueDays[uniqueDays.length - 1]);
    const today = new Date();
    const daysSinceLastSession = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSession <= 1) {
      currentStreak = tempStreak;
    }

    return { currentStreak, longestStreak };
  };

  const getWeeklyChartData = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const dailyData = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize all days with 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dailyData[dayName] = { day: dayName, sessions: 0, duration: 0 };
    }

    // Fill in actual data
    sessions.filter(s => s.end_time && new Date(s.start_time) >= weekAgo).forEach(session => {
      const date = new Date(session.start_time);
      const dayName = days[date.getDay()];
      if (dailyData[dayName]) {
        dailyData[dayName].sessions += 1;
        dailyData[dayName].duration += (session.duration_seconds || 0) / 60; // Convert to minutes
      }
    });

    return Object.values(dailyData);
  };

  const getCircleStats = async (circleId) => {
    const { data: circleSessions } = await supabase
      .from('sessions')
      .select('duration_seconds, user_id')
      .eq('circle_id', circleId)
      .not('end_time', 'is', null);

    if (!circleSessions || circleSessions.length === 0) {
      return { avgDuration: 0, totalSessions: 0, userRank: 0 };
    }

    const totalDuration = circleSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const avgDuration = Math.round(totalDuration / circleSessions.length);

    // Calculate user's rank in circle
    const userStats = {};
    circleSessions.forEach(s => {
      if (!userStats[s.user_id]) {
        userStats[s.user_id] = { count: 0, totalDuration: 0 };
      }
      userStats[s.user_id].count += 1;
      userStats[s.user_id].totalDuration += (s.duration_seconds || 0);
    });

    const rankings = Object.entries(userStats)
      .map(([userId, stats]) => ({
        userId,
        avgDuration: stats.totalDuration / stats.count
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);

    const userRank = rankings.findIndex(r => r.userId === user?.id) + 1;

    return {
      avgDuration,
      totalSessions: circleSessions.length,
      userRank,
      totalMembers: new Set(circleSessions.map(s => s.user_id)).size
    };
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.username || 'User'}</h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('circles')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'circles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Circles
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
                    <p className="text-3xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} days</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Time</p>
                    <p className="text-3xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getWeeklyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold text-gray-900">{stats.thisWeekSessions} sessions</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">{stats.thisMonthSessions} sessions</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Longest Streak</span>
                    <span className="font-semibold text-gray-900">{stats.longestStreak} days</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Circles</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Circles</span>
                    <span className="font-semibold text-gray-900">{circles.length}</span>
                  </div>
                  {circles.length > 0 ? (
                    <div className="text-sm text-gray-500">
                      {circles.slice(0, 3).map(circle => (
                        <div key={circle.id} className="py-1">{circle.name}</div>
                      ))}
                      {circles.length > 3 && (
                        <div className="text-blue-600 cursor-pointer" onClick={() => setActiveTab('circles')}>
                          +{circles.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not in any circles yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getWeeklyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="duration" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Average vs Target</span>
                      <span className="font-semibold">{Math.round((stats.avgDuration / 1800) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((stats.avgDuration / 1800) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Target: 30 minutes</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Consistency Score</span>
                      <span className="font-semibold">{Math.round((stats.currentStreak / 30) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((stats.currentStreak / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Based on 30-day streak</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                <div className="space-y-3">
                  {stats.totalSessions >= 10 && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Award className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">10 Sessions</p>
                        <p className="text-xs text-gray-600">Getting started!</p>
                      </div>
                    </div>
                  )}
                  {stats.currentStreak >= 7 && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">7-Day Streak</p>
                        <p className="text-xs text-gray-600">Keep it going!</p>
                      </div>
                    </div>
                  )}
                  {stats.totalDuration >= 3600 && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900">1 Hour Total</p>
                        <p className="text-xs text-gray-600">Time well spent!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'circles' && (
          <div className="space-y-6">
            {circles.length > 0 ? (
              circles.map(circle => (
                <CircleStatsCard 
                  key={circle.id} 
                  circle={circle}
                  userId={user?.id}
                  getCircleStats={getCircleStats}
                  formatDuration={formatDuration}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Circles Yet</h3>
                <p className="text-gray-600 mb-4">Join a circle to compare your stats with others</p>
                <button 
                  onClick={() => navigate('/circles')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Circles
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Session History</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {sessions.length > 0 ? (
                sessions.filter(s => s.end_time).map(session => (
                  <div key={session.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatDuration(session.duration_seconds || 0)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(session.start_time)}
                          </p>
                          {session.tag && (
                            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                              {session.tag}
                            </span>
                          )}
                        </div>
                      </div>
                      {session.circle_id && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Circle Session</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No sessions yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start your first session to see it here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Circle Stats Component
const CircleStatsCard = ({ circle, userId, getCircleStats, formatDuration }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const circleStats = await getCircleStats(circle.id);
      setStats(circleStats);
      setLoading(false);
    };
    fetchStats();
  }, [circle.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{circle.name}</h3>
          <p className="text-sm text-gray-600">{circle.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Your Rank</p>
          <p className="text-2xl font-bold text-blue-600">#{stats?.userRank || '-'}</p>
          <p className="text-xs text-gray-500">of {stats?.totalMembers || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Circle Avg</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatDuration(stats?.avgDuration || 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
          <p className="text-lg font-semibold text-gray-900">{stats?.totalSessions || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Members</p>
          <p className="text-lg font-semibold text-gray-900">{stats?.totalMembers || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
