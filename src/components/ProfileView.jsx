import React, { useState, useEffect } from 'react';
import { User, Clock, TrendingUp, Users, Calendar, Award, LogOut } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Profile = ({ user, profile, sessions, circles, onLogout }) => {
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
    if (sessions && sessions.length > 0) {
      calculateStats(sessions);
    }
  }, [sessions]);

  const calculateStats = (sessionsData) => {
    const completedSessions = sessionsData.filter(s => s.end_time && s.duration_seconds);
    
    const totalSessions = completedSessions.length;
    const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekSessions = completedSessions.filter(s => 
      new Date(s.start_time) >= weekAgo
    ).length;

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const thisMonthSessions = completedSessions.filter(s => 
      new Date(s.start_time) >= monthAgo
    ).length;

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

    const sorted = [...sessionsData].sort((a, b) => 
      new Date(a.start_time) - new Date(b.start_time)
    );

    const days = new Set(sorted.map(s => 
      new Date(s.start_time).toDateString()
    ));
    const uniqueDays = Array.from(days).sort((a, b) => 
      new Date(a) - new Date(b)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

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
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dailyData[dayName] = { day: dayName, sessions: 0, duration: 0 };
    }

    sessions.filter(s => s.end_time && new Date(s.start_time) >= weekAgo).forEach(session => {
      const date = new Date(session.start_time);
      const dayName = days[date.getDay()];
      if (dailyData[dayName]) {
        dailyData[dayName].sessions += 1;
        dailyData[dayName].duration += (session.duration_seconds || 0) / 60;
      }
    });

    return Object.values(dailyData);
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-x-border z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold">{profile?.username || 'User'}</h2>
                <p className="text-x-gray text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-x-gray hover:text-white transition p-2"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-x-border bg-black sticky top-[65px] z-10">
        <div className="flex px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-medium text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-x-blue text-white'
                : 'border-transparent text-x-gray hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 font-medium text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-x-blue text-white'
                : 'border-transparent text-x-gray hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 font-medium text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-x-blue text-white'
                : 'border-transparent text-x-gray hover:text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-x-border rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar size={18} className="text-x-gray" />
                  <h3 className="text-sm text-x-gray">Total Sessions</h3>
                </div>
                <p className="text-3xl font-bold">{stats.totalSessions}</p>
              </div>

              <div className="border border-x-border rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock size={18} className="text-x-gray" />
                  <h3 className="text-sm text-x-gray">Avg Duration</h3>
                </div>
                <p className="text-3xl font-bold">{formatDuration(stats.avgDuration)}</p>
              </div>

              <div className="border border-x-border rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp size={18} className="text-x-gray" />
                  <h3 className="text-sm text-x-gray">Current Streak</h3>
                </div>
                <p className="text-3xl font-bold">{stats.currentStreak}</p>
                <p className="text-x-gray text-xs">days</p>
              </div>

              <div className="border border-x-border rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Award size={18} className="text-x-gray" />
                  <h3 className="text-sm text-x-gray">Total Time</h3>
                </div>
                <p className="text-3xl font-bold">{formatDuration(stats.totalDuration)}</p>
              </div>
            </div>

            {/* Weekly Chart */}
            <div className="border border-x-border rounded-2xl p-4">
              <h3 className="font-bold mb-4">This Week's Activity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getWeeklyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="border border-x-border rounded-2xl p-4">
              <h3 className="font-bold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-x-gray">This Week</span>
                  <span className="font-semibold">{stats.thisWeekSessions} sessions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-x-gray">This Month</span>
                  <span className="font-semibold">{stats.thisMonthSessions} sessions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-x-gray">Longest Streak</span>
                  <span className="font-semibold">{stats.longestStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-x-gray">Circles</span>
                  <span className="font-semibold">{circles.length}/3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="border border-x-border rounded-2xl p-4">
              <h3 className="font-bold mb-4">Duration Trends</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={getWeeklyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="duration" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-x-border rounded-2xl p-4">
              <h3 className="font-bold mb-4">Performance Insights</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-x-gray text-sm">Average vs Target (30 min)</span>
                    <span className="font-semibold">{Math.round((stats.avgDuration / 1800) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((stats.avgDuration / 1800) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-x-gray text-sm">Consistency (30 days)</span>
                    <span className="font-semibold">{Math.round((stats.currentStreak / 30) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((stats.currentStreak / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-x-border rounded-2xl p-4">
              <h3 className="font-bold mb-3">Achievements</h3>
              <div className="space-y-2">
                {stats.totalSessions >= 10 && (
                  <div className="flex items-center space-x-3 p-3 bg-x-hover rounded-xl border border-x-border">
                    <Award className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-semibold">10 Sessions</p>
                      <p className="text-xs text-x-gray">Getting started!</p>
                    </div>
                  </div>
                )}
                {stats.currentStreak >= 7 && (
                  <div className="flex items-center space-x-3 p-3 bg-x-hover rounded-xl border border-x-border">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-semibold">7-Day Streak</p>
                      <p className="text-xs text-x-gray">Keep it going!</p>
                    </div>
                  </div>
                )}
                {stats.totalDuration >= 3600 && (
                  <div className="flex items-center space-x-3 p-3 bg-x-hover rounded-xl border border-x-border">
                    <Clock className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="font-semibold">1 Hour Total</p>
                      <p className="text-xs text-x-gray">Time well spent!</p>
                    </div>
                  </div>
                )}
                {stats.totalSessions === 0 && (
                  <p className="text-x-gray text-center py-8">Complete sessions to unlock achievements!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {sessions.filter(s => s.end_time).length > 0 ? (
              sessions.filter(s => s.end_time).map(session => (
                <div key={session.id} className="border border-x-border rounded-xl p-4 hover:bg-x-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {formatDuration(session.duration_seconds || 0)}
                        </p>
                        <p className="text-sm text-x-gray">
                          {formatDate(session.start_time)}
                        </p>
                      </div>
                    </div>
                    {session.circle_id && (
                      <Users className="w-4 h-4 text-x-gray" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-x-border rounded-2xl p-12 text-center">
                <Calendar size={48} className="mx-auto mb-4 text-x-gray" />
                <p className="text-x-gray">No sessions yet</p>
                <p className="text-sm text-x-gray mt-2">Start your first session to see it here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
