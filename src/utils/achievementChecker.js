// Achievement Checker - Checks and unlocks achievements after each session
// src/utils/achievementChecker.js

import { ACHIEVEMENTS, calculateXP, getLevelFromXP } from './achievements';

export class AchievementChecker {
  constructor(supabase) {
    this.supabase = supabase;
  }

  // Main function: Check and award achievements after session
  async checkAndAwardAchievements(userId) {
    try {
      // 1. Get user stats
      const stats = await this.getUserStats(userId);
      if (!stats) return { newAchievements: [], xpAwarded: 0 };

      // 2. Get already unlocked achievements
      const { data: unlocked } = await this.supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
      
      const unlockedIds = new Set(unlocked?.map(a => a.achievement_id) || []);

      // 3. Check which achievements should be unlocked
      const newAchievements = [];
      
      for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (unlockedIds.has(achievement.id)) continue;
        
        // Check if conditions are met
        if (achievement.checkUnlock(stats)) {
          newAchievements.push(achievement);
        }
      }

      // 4. Award new achievements
      let totalXpAwarded = 0;
      
      for (const achievement of newAchievements) {
        await this.awardAchievement(userId, achievement);
        totalXpAwarded += achievement.xp;
      }

      // 5. Update user XP and level
      if (totalXpAwarded > 0) {
        await this.awardXP(userId, totalXpAwarded);
      }

      return { 
        newAchievements, 
        xpAwarded: totalXpAwarded,
        stats 
      };

    } catch (error) {
      console.error('Error checking achievements:', error);
      return { newAchievements: [], xpAwarded: 0 };
    }
  }

  // Award single achievement
  async awardAchievement(userId, achievement) {
    try {
      await this.supabase
        .from('user_achievements')
        .insert([{
          user_id: userId,
          achievement_id: achievement.id,
          achievement_name: achievement.name,
          xp_awarded: achievement.xp
        }]);
      
      console.log(`✅ Unlocked: ${achievement.name} (+${achievement.xp} XP)`);
    } catch (error) {
      console.error(`Failed to award ${achievement.name}:`, error);
    }
  }

  // Award XP and update level
  async awardXP(userId, xpAmount) {
    try {
      // Get current XP
      const { data: currentData } = await this.supabase
        .from('user_xp')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .single();

      const newTotalXP = (currentData?.total_xp || 0) + xpAmount;
      const levelObj = getLevelFromXP(newTotalXP);
      const newLevel = levelObj.level;  // Extract just the number
      const oldLevel = currentData?.current_level || 1;

      // Update XP and level
      await this.supabase
        .from('user_xp')
        .upsert({
          user_id: userId,
          total_xp: newTotalXP,
          current_level: newLevel  // Now it's just a number!
        }, {
          onConflict: 'user_id'  // ← Tell it which column to check!
        });

      // Log level up
      if (newLevel > oldLevel) {
        console.log(`🎉 LEVEL UP! ${oldLevel} → ${newLevel}`);
      }

      return { newTotalXP, newLevel, leveledUp: newLevel > oldLevel, oldLevel };
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  }

  // Update user stats after session
  async updateStatsAfterSession(userId, session) {
    try {
      const { data: stats } = await this.supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!stats) {
        // Initialize stats if not exist
        await this.supabase
          .from('user_stats')
          .insert([{ user_id: userId }]);
        return;
      }

      const duration = session.duration_seconds;
      const sessionDate = new Date(session.created_at);
      const hour = sessionDate.getHours();
      const dayOfWeek = sessionDate.getDay();

      // Calculate new stats
      const updates = {
        total_sessions: (stats.total_sessions || 0) + 1,
        total_duration_seconds: (stats.total_duration_seconds || 0) + duration,
        longest_session_seconds: Math.max(stats.longest_session_seconds || 0, duration),
        
        // Time-based
        sessions_after_midnight: hour >= 0 && hour < 6 
          ? (stats.sessions_after_midnight || 0) + 1 
          : stats.sessions_after_midnight,
        sessions_before_6am: hour < 6 
          ? (stats.sessions_before_6am || 0) + 1 
          : stats.sessions_before_6am,
        sessions_at_3am: hour === 3 
          ? (stats.sessions_at_3am || 0) + 1 
          : stats.sessions_at_3am,
        weekend_sessions: (dayOfWeek === 0 || dayOfWeek === 6)
          ? (stats.weekend_sessions || 0) + 1
          : stats.weekend_sessions,
        
        // Duration-based
        sessions_over_1hr: duration >= 3600 
          ? (stats.sessions_over_1hr || 0) + 1 
          : stats.sessions_over_1hr,
        sessions_over_2hr: duration >= 7200 
          ? (stats.sessions_over_2hr || 0) + 1 
          : stats.sessions_over_2hr,
        sessions_over_3hr: duration >= 10800 
          ? (stats.sessions_over_3hr || 0) + 1 
          : stats.sessions_over_3hr,
        sessions_under_10min: duration < 600 
          ? (stats.sessions_under_10min || 0) + 1 
          : stats.sessions_under_10min,
        
        // Streak calculation
        last_session_date: sessionDate.toISOString().split('T')[0]
      };

      // Calculate streak
      const lastDate = stats.last_session_date ? new Date(stats.last_session_date) : null;
      const today = new Date(sessionDate.toISOString().split('T')[0]);
      
      if (lastDate) {
        const daysDiff = Math.floor((today - new Date(lastDate)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Same day - streak continues
          updates.current_streak = stats.current_streak || 1;
        } else if (daysDiff === 1) {
          // Next day - increment streak
          updates.current_streak = (stats.current_streak || 0) + 1;
          updates.longest_streak = Math.max(
            stats.longest_streak || 0, 
            updates.current_streak
          );
        } else {
          // Streak broken - reset to 1
          updates.current_streak = 1;
        }
      } else {
        // First session
        updates.current_streak = 1;
        updates.longest_streak = 1;
      }

      // Update stats
      await this.supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', userId);

      console.log('📊 Stats updated:', updates);
      
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  // Calculate XP for session
  calculateSessionXP(durationSeconds) {
    return calculateXP(durationSeconds);
  }

  // Get user stats for achievement checking
  async getUserStats(userId) {
    try {
      // Get base stats
      const { data: stats } = await this.supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!stats) return null;

      // Get circles count
      const { data: circles } = await this.supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', userId);

      // Get achievements count
      const { data: achievements } = await this.supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      // Get current level
      const { data: xpData } = await this.supabase
        .from('user_xp')
        .select('current_level, total_xp')
        .eq('user_id', userId)
        .single();

      // Get profile info
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('id', userId)
        .single();

      // Combine all stats
      return {
        ...stats,
        circlesJoined: circles?.length || 0,
        achievementsUnlocked: achievements?.length || 0,
        level: xpData?.current_level || 1,
        totalXP: xpData?.total_xp || 0,
        hasProfilePicture: !!profile?.avatar_url,
        hasChangedUsername: profile?.username !== userId.substring(0, 8),
        
        // Calculated values
        totalSessions: stats.total_sessions || 0,
        totalDuration: stats.total_duration_seconds || 0,
        longestSession: stats.longest_session_seconds || 0,
        currentStreak: stats.current_streak || 0,
        accountAgeDays: stats.account_created_at 
          ? Math.floor((Date.now() - new Date(stats.account_created_at)) / (1000 * 60 * 60 * 24))
          : 0
      };
      
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  }

  // Get user's unlocked achievements
  async getUnlockedAchievements(userId) {
    try {
      const { data } = await this.supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      
      return data || [];
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }

  // Get user XP and level
  async getUserXP(userId) {
    try {
      const { data } = await this.supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return data || { total_xp: 0, current_level: 1 };
    } catch (error) {
      console.error('Failed to get user XP:', error);
      return { total_xp: 0, current_level: 1 };
    }
  }
}

// Export singleton instance creator
export const createAchievementChecker = (supabase) => {
  return new AchievementChecker(supabase);
};

export default AchievementChecker;
