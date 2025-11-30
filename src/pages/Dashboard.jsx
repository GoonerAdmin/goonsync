import React from 'react';
import { Play, Square, TrendingUp, Users, Clock } from 'lucide-react';
import Button from '../components/Button';
import SyncCard from '../components/SyncCard';

const Dashboard = ({ 
  user,
  profile,
  isSyncing, 
  elapsedTime, 
  onStartSync, 
  onStopSync,
  circles,
  sessions,
  activeUsers,
  analytics
}) => {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const otherActiveUsers = activeUsers.filter(u => u.user_id !== user?.id);
  const recentSessions = sessions.filter(s => s.duration_seconds).slice(0, 10);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-x-border z-10">
        <div className="px-4 py-3">
          <h2 className="text-xl font-bold">Home</h2>
        </div>
      </div>

      {/* Active Users Alert */}
      {otherActiveUsers.length > 0 && !isSyncing && (
        <div className="border-b border-x-border bg-green-500/5 p-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-400">
              {otherActiveUsers.map(u => u.username).join(', ')} {otherActiveUsers.length === 1 ? 'is' : 'are'} syncing now!
            </p>
          </div>
        </div>
      )}

      {/* Main Sync Control */}
      <div className="border-b border-x-border p-6">
        {!isSyncing ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-2">Ready to sync?</h3>
            <p className="text-x-gray mb-6">
              {circles.length === 0 
                ? 'Join a circle to get started' 
                : `Connected to ${circles.length} circle${circles.length > 1 ? 's' : ''}`
              }
            </p>
            <Button 
              onClick={onStartSync}
              disabled={circles.length === 0}
              variant="primary"
              size="lg"
              icon={Play}
            >
              Start Sync
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Active Session</span>
              </div>
            </div>
            <div className="text-6xl font-mono font-bold mb-6 tracking-tight">
              {formatTime(elapsedTime)}
            </div>
            <Button 
              onClick={onStopSync}
              variant="danger"
              size="lg"
              icon={Square}
            >
              End Session
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 border-b border-x-border">
        <div className="p-4 border-r border-x-border text-center hover:bg-x-hover transition-colors">
          <div className="text-2xl font-bold">{analytics?.totalSessions || 0}</div>
          <div className="text-x-gray text-xs mt-1">Sessions</div>
        </div>
        <div className="p-4 border-r border-x-border text-center hover:bg-x-hover transition-colors">
          <div className="text-2xl font-bold">{formatTime(Math.floor(analytics?.avgDuration || 0))}</div>
          <div className="text-x-gray text-xs mt-1">Avg Time</div>
        </div>
        <div className="p-4 text-center hover:bg-x-hover transition-colors">
          <div className="text-2xl font-bold">{activeUsers?.length || 0}</div>
          <div className="text-x-gray text-xs mt-1">Active Now</div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        {recentSessions.length === 0 ? (
          <div className="p-12 text-center border-b border-x-border">
            <Clock size={48} className="mx-auto mb-4 text-x-gray" />
            <p className="text-x-gray">No recent activity</p>
            <p className="text-x-gray text-sm mt-1">Start your first sync session!</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-x-border">
              <h3 className="font-bold text-sm text-x-gray">Recent Activity</h3>
            </div>
            {recentSessions.map((session) => (
              <SyncCard 
                key={session.id} 
                sync={session} 
                currentUser={user}
              />
            ))}
          </>
        )}
      </div>

      {/* Trending/Suggestions (Placeholder for future) */}
      <div className="p-6 border-b border-x-border bg-x-hover/30">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={20} className="text-x-gray" />
          <h3 className="font-bold">What's trending</h3>
        </div>
        <p className="text-x-gray text-sm">Coming soon - see what your friends are up to</p>
      </div>
    </div>
  );
};

export default Dashboard;
