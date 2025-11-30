import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Users as UsersIcon, Clock } from 'lucide-react';

const SyncCard = ({ sync, currentUser }) => {
  const isOwner = sync.user_id === currentUser?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-x-border p-4 hover:bg-x-hover/50 transition-colors cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold flex-shrink-0">
            {sync.username?.[0]?.toUpperCase() || 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold hover:underline">{sync.username || 'User'}</span>
              <span className="text-x-gray">@{sync.username || 'user'}</span>
              <span className="text-x-gray">·</span>
              <span className="text-x-gray">{getTimeAgo(sync.created_at)}</span>
            </div>

            {/* Sync Status */}
            <div className="mt-2">
              {sync.end_time ? (
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-green-500" />
                  <span className="text-white">
                    Completed session - {formatDuration(sync.duration_seconds)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">Syncing now</span>
                </div>
              )}
            </div>

            {/* Circle Info */}
            {sync.circle_name && (
              <div className="mt-2 text-x-gray text-sm">
                in {sync.circle_name}
              </div>
            )}
          </div>
        </div>

        {/* More Options */}
        {isOwner && (
          <button className="text-x-gray hover:text-x-blue hover:bg-x-blue/10 rounded-full p-2 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>

      {/* Stats/Info */}
      {sync.duration_seconds && (
        <div className="flex items-center gap-6 mt-3 text-x-gray">
          <div className="flex items-center gap-2 hover:text-green-500 transition-colors group cursor-pointer">
            <div className="group-hover:bg-green-500/10 rounded-full p-2 transition-colors">
              <Clock size={18} />
            </div>
            <span className="text-sm">{formatDuration(sync.duration_seconds)}</span>
          </div>

          {sync.participant_count > 1 && (
            <div className="flex items-center gap-2">
              <UsersIcon size={18} />
              <span className="text-sm">{sync.participant_count} syncing</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Helper functions
const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

export default SyncCard;
