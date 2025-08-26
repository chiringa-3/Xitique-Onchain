import { Achievement, UserAchievement, Challenge, UserChallenge, Streak, ActivityLog, Leaderboard } from "@shared/schema";

// Reward calculation constants
export const ACTIVITY_POINTS = {
  JOIN_GROUP: 50,
  FIRST_CONTRIBUTION: 100,
  ON_TIME_CONTRIBUTION: 25,
  WIN_CYCLE: 200,
  PARTICIPATE_VOTE: 15,
  CREATE_PROPOSAL: 30,
  COMPLETE_CHALLENGE: 50,
  STREAK_BONUS: 10, // per day in streak
  EARLY_BIRD: 20, // contributing within first 24 hours
  SOCIAL_BUTTERFLY: 25, // joining multiple groups
} as const;

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Record<string, Omit<Achievement, 'id' | 'createdAt'>> = {
  FIRST_STEPS: {
    name: "First Steps",
    description: "Join your first Xitique group",
    category: "participation",
    icon: "🚀",
    rarity: "common",
    pointsReward: 50,
    badgeColor: "bg-blue-100 text-blue-800",
    requirements: JSON.stringify({ joinGroups: 1 }),
    isActive: true,
  },
  EARLY_BIRD: {
    name: "Early Bird",
    description: "Make your first contribution within 24 hours",
    category: "contribution",
    icon: "🐦",
    rarity: "common",
    pointsReward: 75,
    badgeColor: "bg-yellow-100 text-yellow-800",
    requirements: JSON.stringify({ earlyContribution: true }),
    isActive: true,
  },
  STREAK_MASTER: {
    name: "Streak Master",
    description: "Maintain a 7-day contribution streak",
    category: "contribution",
    icon: "🔥",
    rarity: "rare",
    pointsReward: 200,
    badgeColor: "bg-orange-100 text-orange-800",
    requirements: JSON.stringify({ contributionStreak: 7 }),
    isActive: true,
  },
  SOCIAL_BUTTERFLY: {
    name: "Social Butterfly",
    description: "Join 5 different groups",
    category: "social",
    icon: "🦋",
    rarity: "rare",
    pointsReward: 150,
    badgeColor: "bg-purple-100 text-purple-800",
    requirements: JSON.stringify({ joinGroups: 5 }),
    isActive: true,
  },
  CHAMPION: {
    name: "Champion",
    description: "Win 3 group cycles",
    category: "milestone",
    icon: "🏆",
    rarity: "epic",
    pointsReward: 500,
    badgeColor: "bg-yellow-100 text-yellow-800",
    requirements: JSON.stringify({ winCycles: 3 }),
    isActive: true,
  },
  GOVERNANCE_GURU: {
    name: "Governance Guru",
    description: "Create 10 proposals and vote 50 times",
    category: "participation",
    icon: "🏛️",
    rarity: "epic",
    pointsReward: 300,
    badgeColor: "bg-indigo-100 text-indigo-800",
    requirements: JSON.stringify({ createProposals: 10, votes: 50 }),
    isActive: true,
  },
  LEGENDARY_CONTRIBUTOR: {
    name: "Legendary Contributor",
    description: "Contribute to 100 cycles without missing any",
    category: "milestone",
    icon: "💎",
    rarity: "legendary",
    pointsReward: 1000,
    badgeColor: "bg-gradient-to-r from-purple-400 to-pink-400 text-white",
    requirements: JSON.stringify({ perfectContributions: 100 }),
    isActive: true,
  },
  COMMUNITY_BUILDER: {
    name: "Community Builder",
    description: "Help 20 new members join groups",
    category: "social",
    icon: "🤝",
    rarity: "epic",
    pointsReward: 400,
    badgeColor: "bg-green-100 text-green-800",
    requirements: JSON.stringify({ helpedJoin: 20 }),
    isActive: true,
  },
};

// Challenge definitions
export const WEEKLY_CHALLENGES: Record<string, Omit<Challenge, 'id' | 'createdAt' | 'startDate' | 'endDate'>> = {
  CONTRIBUTION_SPRINT: {
    name: "Contribution Sprint",
    description: "Make contributions to 3 different groups this week",
    challengeType: "weekly",
    requirements: JSON.stringify({ contributeToGroups: 3, timeframe: "week" }),
    pointsReward: 100,
    isActive: true,
  },
  SOCIAL_CONNECTOR: {
    name: "Social Connector",
    description: "Invite 2 friends to join Xitique groups",
    challengeType: "weekly",
    requirements: JSON.stringify({ inviteFriends: 2 }),
    pointsReward: 150,
    isActive: true,
  },
  GOVERNANCE_PARTICIPANT: {
    name: "Governance Participant",
    description: "Vote on 5 proposals this week",
    challengeType: "weekly",
    requirements: JSON.stringify({ vote: 5, timeframe: "week" }),
    pointsReward: 75,
    isActive: true,
  },
};

// Daily challenges
export const DAILY_CHALLENGES: Record<string, Omit<Challenge, 'id' | 'createdAt' | 'startDate' | 'endDate'>> = {
  DAILY_CHECK_IN: {
    name: "Daily Check-in",
    description: "Visit your groups and check cycle status",
    challengeType: "daily",
    requirements: JSON.stringify({ checkGroups: 1 }),
    pointsReward: 10,
    isActive: true,
  },
  EARLY_CONTRIBUTION: {
    name: "Early Bird Contributor",
    description: "Make a contribution before noon",
    challengeType: "daily",
    requirements: JSON.stringify({ contributeEarly: true }),
    pointsReward: 25,
    isActive: true,
  },
};

// Rarity colors and effects
export const RARITY_STYLES = {
  common: {
    borderColor: "border-gray-300",
    bgGradient: "bg-gradient-to-br from-gray-50 to-gray-100",
    glowEffect: "",
    textColor: "text-gray-800",
  },
  rare: {
    borderColor: "border-blue-300",
    bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    glowEffect: "shadow-blue-200 shadow-lg",
    textColor: "text-blue-800",
  },
  epic: {
    borderColor: "border-purple-300",
    bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100",
    glowEffect: "shadow-purple-200 shadow-lg",
    textColor: "text-purple-800",
  },
  legendary: {
    borderColor: "border-yellow-300",
    bgGradient: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    glowEffect: "shadow-yellow-200 shadow-xl animate-pulse",
    textColor: "text-yellow-800",
  },
} as const;

// Helper functions
export function calculatePoints(activityType: keyof typeof ACTIVITY_POINTS, metadata?: any): number {
  let basePoints = ACTIVITY_POINTS[activityType];
  
  // Add bonus points based on context
  if (metadata?.streak && activityType === 'ON_TIME_CONTRIBUTION') {
    basePoints += Math.min(metadata.streak * ACTIVITY_POINTS.STREAK_BONUS, 100); // Cap at 100 bonus
  }
  
  if (metadata?.early && activityType === 'ON_TIME_CONTRIBUTION') {
    basePoints += ACTIVITY_POINTS.EARLY_BIRD;
  }
  
  return basePoints;
}

export function checkAchievementProgress(
  achievementKey: string, 
  userStats: any
): { isCompleted: boolean; progress: number; total: number } {
  const achievement = ACHIEVEMENT_DEFINITIONS[achievementKey];
  if (!achievement) return { isCompleted: false, progress: 0, total: 1 };
  
  const requirements = JSON.parse(achievement.requirements);
  
  switch (achievementKey) {
    case 'FIRST_STEPS':
      return {
        isCompleted: userStats.groupsJoined >= 1,
        progress: userStats.groupsJoined,
        total: 1,
      };
      
    case 'STREAK_MASTER':
      return {
        isCompleted: userStats.longestStreak >= 7,
        progress: Math.min(userStats.longestStreak, 7),
        total: 7,
      };
      
    case 'SOCIAL_BUTTERFLY':
      return {
        isCompleted: userStats.groupsJoined >= 5,
        progress: Math.min(userStats.groupsJoined, 5),
        total: 5,
      };
      
    case 'CHAMPION':
      return {
        isCompleted: userStats.cyclesWon >= 3,
        progress: Math.min(userStats.cyclesWon, 3),
        total: 3,
      };
      
    case 'GOVERNANCE_GURU':
      const proposalsProgress = Math.min(userStats.proposalsCreated || 0, 10);
      const votesProgress = Math.min(userStats.votesSubmitted || 0, 50);
      const totalProgress = proposalsProgress + (votesProgress / 5); // Scale votes to match proposals
      return {
        isCompleted: userStats.proposalsCreated >= 10 && userStats.votesSubmitted >= 50,
        progress: Math.min(totalProgress, 15),
        total: 15,
      };
      
    case 'LEGENDARY_CONTRIBUTOR':
      return {
        isCompleted: userStats.perfectContributions >= 100,
        progress: Math.min(userStats.perfectContributions, 100),
        total: 100,
      };
      
    default:
      return { isCompleted: false, progress: 0, total: 1 };
  }
}

export function getNextMilestone(userPoints: number): { 
  nextLevel: number; 
  pointsNeeded: number; 
  levelName: string;
  currentLevel: number;
} {
  const levels = [
    { points: 0, name: "Newcomer" },
    { points: 100, name: "Contributor" },
    { points: 500, name: "Active Member" },
    { points: 1000, name: "Group Veteran" },
    { points: 2500, name: "Community Champion" },
    { points: 5000, name: "Xitique Master" },
    { points: 10000, name: "Legendary Saver" },
  ];
  
  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (userPoints >= levels[i].points) {
      currentLevel = i;
      break;
    }
  }
  
  const nextLevel = Math.min(currentLevel + 1, levels.length - 1);
  const pointsNeeded = levels[nextLevel].points - userPoints;
  
  return {
    nextLevel,
    pointsNeeded: Math.max(0, pointsNeeded),
    levelName: levels[nextLevel].name,
    currentLevel,
  };
}

export function generateFireworks(): void {
  // Simple confetti effect for achievements
  if (typeof window !== 'undefined') {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '6px';
      confetti.style.height = '6px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-10px';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      confetti.style.borderRadius = '50%';
      
      document.body.appendChild(confetti);
      
      const fallDuration = Math.random() * 3 + 2;
      const drift = (Math.random() - 0.5) * 100;
      
      confetti.animate([
        { transform: 'translateY(0px) translateX(0px) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight + 10}px) translateX(${drift}px) rotate(360deg)`, opacity: 0 }
      ], {
        duration: fallDuration * 1000,
        easing: 'ease-out'
      }).onfinish = () => confetti.remove();
    }
  }
}