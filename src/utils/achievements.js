// achievements.js - Complete achievement system definitions

export const ACHIEVEMENTS = [
  // === BEGINNER ACHIEVEMENTS ===
  {
    id: 'the_virgin',
    name: 'The Virgin',
    description: 'Complete your first session',
    xp: 50,
    condition: (stats) => stats.totalSessions >= 1
  },
  {
    id: 'bronze_beater',
    name: 'Bronze Beater',
    description: 'Complete 10 sessions',
    xp: 100,
    condition: (stats) => stats.totalSessions >= 10
  },
  {
    id: 'the_rookie',
    name: 'The Rookie',
    description: 'Spend 1 hour total syncing',
    xp: 75,
    condition: (stats) => stats.totalDuration >= 3600
  },
  {
    id: 'quick_shot',
    name: 'Quick Shot',
    description: 'Complete a 5-minute session',
    xp: 50,
    condition: (stats) => stats.hasSession >= 300 && stats.hasSession < 600
  },
  {
    id: 'the_beginner',
    name: 'The Beginner',
    description: 'Reach level 5',
    xp: 100,
    condition: (stats) => stats.level >= 5
  },

  // === INTERMEDIATE ACHIEVEMENTS ===
  {
    id: 'silver_stroker',
    name: 'Silver Stroker',
    description: 'Complete 50 sessions',
    xp: 250,
    condition: (stats) => stats.totalSessions >= 50
  },
  {
    id: 'the_regular',
    name: 'The Regular',
    description: 'Maintain a 7-day streak',
    xp: 200,
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Complete a 1-hour session',
    xp: 300,
    condition: (stats) => stats.longestSession >= 3600
  },
  {
    id: 'the_committed',
    name: 'The Committed',
    description: 'Spend 10 hours total syncing',
    xp: 250,
    condition: (stats) => stats.totalDuration >= 36000
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a session after midnight',
    xp: 150,
    condition: (stats) => stats.hasLateNightSession
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a session before 6 AM',
    xp: 150,
    condition: (stats) => stats.hasEarlyMorningSession
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Join your first circle',
    xp: 100,
    condition: (stats) => stats.circlesJoined >= 1
  },
  {
    id: 'the_one_hander',
    name: 'The One Hander',
    description: 'Complete 3 sessions in one day',
    xp: 200,
    condition: (stats) => stats.maxSessionsPerDay >= 3
  },

  // === ADVANCED ACHIEVEMENTS ===
  {
    id: 'golden_gooner',
    name: 'Golden Gooner',
    description: 'Complete 100 sessions',
    xp: 500,
    condition: (stats) => stats.totalSessions >= 100
  },
  {
    id: 'king_goon',
    name: 'King Goon',
    description: 'Reach level 25',
    xp: 750,
    condition: (stats) => stats.level >= 25
  },
  {
    id: 'the_dedicated',
    name: 'The Dedicated',
    description: 'Maintain a 30-day streak',
    xp: 1000,
    condition: (stats) => stats.currentStreak >= 30
  },
  {
    id: 'ultra_marathoner',
    name: 'Ultra Marathoner',
    description: 'Complete a 2-hour session',
    xp: 600,
    condition: (stats) => stats.longestSession >= 7200
  },
  {
    id: 'the_grinder',
    name: 'The Grinder',
    description: 'Spend 50 hours total syncing',
    xp: 750,
    condition: (stats) => stats.totalDuration >= 180000
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 5 sessions in one day',
    xp: 400,
    condition: (stats) => stats.maxSessionsPerDay >= 5
  },
  {
    id: 'the_veteran',
    name: 'The Veteran',
    description: 'Active for 90 days',
    xp: 500,
    condition: (stats) => stats.accountAgeDays >= 90
  },
  {
    id: 'circle_master',
    name: 'Circle Master',
    description: 'Join 3 circles',
    xp: 300,
    condition: (stats) => stats.circlesJoined >= 3
  },
  {
    id: 'top_performer',
    name: 'Top Performer',
    description: 'Rank #1 in a circle leaderboard',
    xp: 500,
    condition: (stats) => stats.hasRank1InCircle
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 sessions on weekends',
    xp: 300,
    condition: (stats) => stats.weekendSessions >= 10
  },

  // === ELITE ACHIEVEMENTS ===
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    description: 'Complete 250 sessions',
    xp: 1500,
    condition: (stats) => stats.totalSessions >= 250
  },
  {
    id: 'the_legend',
    name: 'The Legend',
    description: 'Reach level 50',
    xp: 2000,
    condition: (stats) => stats.level >= 50
  },
  {
    id: 'eternal_flame',
    name: 'Eternal Flame',
    description: 'Maintain a 100-day streak',
    xp: 2500,
    condition: (stats) => stats.currentStreak >= 100
  },
  {
    id: 'the_beast',
    name: 'The Beast',
    description: 'Complete a 3-hour session',
    xp: 1000,
    condition: (stats) => stats.longestSession >= 10800
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Spend 100 hours total syncing',
    xp: 1500,
    condition: (stats) => stats.totalDuration >= 360000
  },
  {
    id: 'supreme_leader',
    name: 'Supreme Leader',
    description: 'Create and lead a circle to 100 total sessions',
    xp: 1000,
    condition: (stats) => stats.circleCreatorSessions >= 100
  },
  {
    id: 'the_unstoppable',
    name: 'The Unstoppable',
    description: 'Complete 10 sessions in one day',
    xp: 1500,
    condition: (stats) => stats.maxSessionsPerDay >= 10
  },
  {
    id: 'going_platinum',
    name: 'Going Platinum',
    description: 'Reach 50,000 XP',
    xp: 1000,
    condition: (stats) => stats.totalXP >= 50000
  },

  // === SPECIAL ACHIEVEMENTS ===
  {
    id: 'the_insomniac',
    name: 'The Insomniac',
    description: 'Complete sessions at 3 AM on 5 different days',
    xp: 500,
    condition: (stats) => stats.sessions3AM >= 5
  },
  {
    id: 'dawn_patrol',
    name: 'Dawn Patrol',
    description: 'Complete 20 sessions before 7 AM',
    xp: 400,
    condition: (stats) => stats.earlyMorningSessions >= 20
  },
  {
    id: 'midnight_rider',
    name: 'Midnight Rider',
    description: 'Complete 20 sessions after midnight',
    xp: 400,
    condition: (stats) => stats.lateNightSessions >= 20
  },
  {
    id: 'the_marathon_man',
    name: 'The Marathon Man',
    description: 'Complete 5 sessions over 1 hour each',
    xp: 750,
    condition: (stats) => stats.longSessions >= 5
  },
  {
    id: 'sprint_specialist',
    name: 'Sprint Specialist',
    description: 'Complete 20 sessions under 10 minutes',
    xp: 300,
    condition: (stats) => stats.shortSessions >= 20
  },
  {
    id: 'the_destroyer',
    name: 'The Destroyer',
    description: 'Complete a 4-hour session',
    xp: 2000,
    condition: (stats) => stats.longestSession >= 14400
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Complete at least 1 session every day for 30 days',
    xp: 1500,
    condition: (stats) => stats.perfectMonthStreak
  },
  {
    id: 'the_social_king',
    name: 'The Social King',
    description: 'Have the most total time in all your circles',
    xp: 1000,
    condition: (stats) => stats.topInAllCircles
  },
  {
    id: 'triple_threat',
    name: 'Triple Threat',
    description: 'Be in the top 3 of all your circles simultaneously',
    xp: 750,
    condition: (stats) => stats.top3AllCircles
  },
  {
    id: 'the_mentor',
    name: 'The Mentor',
    description: 'Invite 5 people to circles you created',
    xp: 500,
    condition: (stats) => stats.circleInvites >= 5
  },
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Be the first to sync in a new circle',
    xp: 200,
    condition: (stats) => stats.firstInCircle
  },
  {
    id: 'the_showoff',
    name: 'The Showoff',
    description: 'Upload a profile picture',
    xp: 50,
    condition: (stats) => stats.hasProfilePicture
  },
  {
    id: 'fashionista',
    name: 'Fashionista',
    description: 'Change your username',
    xp: 25,
    condition: (stats) => stats.hasChangedUsername
  },
  {
    id: 'the_collector',
    name: 'The Collector',
    description: 'Unlock 10 achievements',
    xp: 500,
    condition: (stats) => stats.achievementsUnlocked >= 10
  },
  {
    id: 'achievement_hunter',
    name: 'Achievement Hunter',
    description: 'Unlock 25 achievements',
    xp: 1000,
    condition: (stats) => stats.achievementsUnlocked >= 25
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock all achievements',
    xp: 5000,
    condition: (stats) => stats.achievementsUnlocked >= ACHIEVEMENTS.length - 1
  }
];

// XP to Level mapping
export const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Novice', color: '#8B4513' }, // Bronze
  { level: 2, xpRequired: 100, title: 'Beginner', color: '#8B4513' },
  { level: 3, xpRequired: 250, title: 'Apprentice', color: '#8B4513' },
  { level: 4, xpRequired: 500, title: 'Learner', color: '#8B4513' },
  { level: 5, xpRequired: 850, title: 'Student', color: '#8B4513' },
  { level: 6, xpRequired: 1300, title: 'Practitioner', color: '#C0C0C0' }, // Silver
  { level: 7, xpRequired: 1850, title: 'Trainee', color: '#C0C0C0' },
  { level: 8, xpRequired: 2500, title: 'Regular', color: '#C0C0C0' },
  { level: 9, xpRequired: 3250, title: 'Experienced', color: '#C0C0C0' },
  { level: 10, xpRequired: 4100, title: 'Skilled', color: '#C0C0C0' },
  { level: 11, xpRequired: 5050, title: 'Adept', color: '#FFD700' }, // Gold
  { level: 12, xpRequired: 6100, title: 'Expert', color: '#FFD700' },
  { level: 13, xpRequired: 7250, title: 'Advanced', color: '#FFD700' },
  { level: 14, xpRequired: 8500, title: 'Superior', color: '#FFD700' },
  { level: 15, xpRequired: 9850, title: 'Elite', color: '#FFD700' },
  { level: 16, xpRequired: 11300, title: 'Master', color: '#E5E4E2' }, // Platinum
  { level: 17, xpRequired: 12850, title: 'Grand Master', color: '#E5E4E2' },
  { level: 18, xpRequired: 14500, title: 'Champion', color: '#E5E4E2' },
  { level: 19, xpRequired: 16250, title: 'Hero', color: '#E5E4E2' },
  { level: 20, xpRequired: 18100, title: 'Legend', color: '#E5E4E2' },
  { level: 21, xpRequired: 20050, title: 'Mythic', color: '#B9F2FF' }, // Diamond
  { level: 22, xpRequired: 22100, title: 'Epic', color: '#B9F2FF' },
  { level: 23, xpRequired: 24250, title: 'Legendary', color: '#B9F2FF' },
  { level: 24, xpRequired: 26500, title: 'Immortal', color: '#B9F2FF' },
  { level: 25, xpRequired: 28850, title: 'Divine', color: '#B9F2FF' },
  { level: 26, xpRequired: 31300, title: 'Godlike', color: '#FF1493' }, // Pink Diamond
  { level: 27, xpRequired: 33850, title: 'Transcendent', color: '#FF1493' },
  { level: 28, xpRequired: 36500, title: 'Celestial', color: '#FF1493' },
  { level: 29, xpRequired: 39250, title: 'Ethereal', color: '#FF1493' },
  { level: 30, xpRequired: 42100, title: 'Supreme', color: '#FF1493' },
  { level: 31, xpRequired: 45050, title: 'Paramount', color: '#9370DB' }, // Purple
  { level: 32, xpRequired: 48100, title: 'Apex', color: '#9370DB' },
  { level: 33, xpRequired: 51250, title: 'Pinnacle', color: '#9370DB' },
  { level: 34, xpRequired: 54500, title: 'Zenith', color: '#9370DB' },
  { level: 35, xpRequired: 57850, title: 'Ultimate', color: '#9370DB' },
  { level: 36, xpRequired: 61300, title: 'Sovereign', color: '#FFD700' }, // Gold Elite
  { level: 37, xpRequired: 64850, title: 'Emperor', color: '#FFD700' },
  { level: 38, xpRequired: 68500, title: 'Overlord', color: '#FFD700' },
  { level: 39, xpRequired: 72250, title: 'Titan', color: '#FFD700' },
  { level: 40, xpRequired: 76100, title: 'Colossus', color: '#FFD700' },
  { level: 41, xpRequired: 80050, title: 'Behemoth', color: '#00CED1' }, // Cyan
  { level: 42, xpRequired: 84100, title: 'Leviathan', color: '#00CED1' },
  { level: 43, xpRequired: 88250, title: 'Juggernaut', color: '#00CED1' },
  { level: 44, xpRequired: 92500, title: 'Unstoppable', color: '#00CED1' },
  { level: 45, xpRequired: 96850, title: 'Invincible', color: '#00CED1' },
  { level: 46, xpRequired: 101300, title: 'Eternal', color: '#FF4500' }, // Red
  { level: 47, xpRequired: 105850, title: 'Infinite', color: '#FF4500' },
  { level: 48, xpRequired: 110500, title: 'Omnipotent', color: '#FF4500' },
  { level: 49, xpRequired: 115250, title: 'Almighty', color: '#FF4500' },
  { level: 50, xpRequired: 120000, title: 'The Goon God', color: '#FFD700' }
];

// XP calculation
export const calculateXP = (durationSeconds) => {
  // Base: 1 XP per minute
  const baseXP = Math.floor(durationSeconds / 60);
  
  // Bonus for longer sessions
  let bonus = 0;
  if (durationSeconds >= 3600) bonus += 100; // 1 hour bonus
  if (durationSeconds >= 7200) bonus += 200; // 2 hour bonus
  if (durationSeconds >= 10800) bonus += 500; // 3 hour bonus
  
  return baseXP + bonus;
};

// Get current level from XP
export const getLevelFromXP = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

// Get progress to next level
export const getProgressToNextLevel = (xp) => {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  
  if (!nextLevel) return { current: xp, required: xp, percentage: 100 };
  
  const current = xp - currentLevel.xpRequired;
  const required = nextLevel.xpRequired - currentLevel.xpRequired;
  const percentage = Math.floor((current / required) * 100);
  
  return { current, required, percentage };
};

// Export LEVELS as LEVEL_SYSTEM for compatibility
export { LEVELS as LEVEL_SYSTEM };

export default ACHIEVEMENTS;
