import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AchievementCard } from "./achievement-card";
import { Trophy, Star, Flame, Target, Users, Calendar } from "lucide-react";
import { ACHIEVEMENT_DEFINITIONS, WEEKLY_CHALLENGES, DAILY_CHALLENGES, getNextMilestone, checkAchievementProgress } from "@/lib/rewards";

interface RewardsDashboardProps {
  userId: string;
}

interface UserStats {
  totalPoints: number;
  groupsJoined: number;
  longestStreak: number;
  cyclesWon: number;
  proposalsCreated: number;
  votesSubmitted: number;
  perfectContributions: number;
  level: number;
  rank: number;
}

// Mock data for demonstration - replace with real API calls
const mockUserStats: UserStats = {
  totalPoints: 1250,
  groupsJoined: 3,
  longestStreak: 5,
  cyclesWon: 1,
  proposalsCreated: 2,
  votesSubmitted: 15,
  perfectContributions: 12,
  level: 2,
  rank: 15,
};

const mockUserAchievements = [
  { achievementId: 'FIRST_STEPS', isCompleted: true, earnedAt: new Date('2024-01-15') },
  { achievementId: 'EARLY_BIRD', isCompleted: true, earnedAt: new Date('2024-01-16') },
];

const mockActiveChallenges = [
  { challengeId: 'CONTRIBUTION_SPRINT', progress: 2, timeRemaining: '3 days' },
  { challengeId: 'DAILY_CHECK_IN', progress: 1, timeRemaining: '18 hours' },
];

export function RewardsDashboard({ userId }: RewardsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  // In a real app, these would be API calls
  const userStats = mockUserStats;
  const userAchievements = mockUserAchievements;
  const activeChallenges = mockActiveChallenges;

  const milestone = getNextMilestone(userStats.totalPoints);
  const levelProgress = ((userStats.totalPoints - (milestone.currentLevel * 500)) / 500) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold" data-testid="text-total-points">
                  {userStats.totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-2xl font-bold" data-testid="text-current-level">
                  {milestone.currentLevel + 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold" data-testid="text-longest-streak">
                  {userStats.longestStreak}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Global Rank</p>
                <p className="text-2xl font-bold" data-testid="text-global-rank">
                  #{userStats.rank}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Level Progress
          </CardTitle>
          <CardDescription>
            {milestone.pointsNeeded > 0 
              ? `${milestone.pointsNeeded} points to reach ${milestone.levelName}`
              : `You've reached the highest level!`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {milestone.currentLevel + 1}</span>
              <span>{milestone.levelName}</span>
            </div>
            <Progress value={levelProgress} className="h-3" data-testid="progress-level" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{userStats.totalPoints} points</span>
              <span>Next: {(milestone.currentLevel + 1) * 500} points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges" data-testid="tab-challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAchievements.slice(0, 4).map((userAch) => {
                  const achievement = ACHIEVEMENT_DEFINITIONS[userAch.achievementId];
                  if (!achievement) return null;
                  
                  return (
                    <AchievementCard
                      key={userAch.achievementId}
                      achievement={{ ...achievement, id: userAch.achievementId, createdAt: new Date() }}
                      userAchievement={userAch as any}
                      isCompleted={userAch.isCompleted}
                      size="sm"
                      showProgress={false}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Active Challenges
              </CardTitle>
              <CardDescription>Complete these for bonus points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeChallenges.map((challenge) => {
                  const challengeData = { 
                    ...WEEKLY_CHALLENGES[challenge.challengeId] || DAILY_CHALLENGES[challenge.challengeId] 
                  };
                  if (!challengeData) return null;

                  const requirements = JSON.parse(challengeData.requirements);
                  const total = requirements.contributeToGroups || requirements.vote || 1;
                  const progressPercent = (challenge.progress / total) * 100;

                  return (
                    <div key={challenge.challengeId} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{challengeData.name}</h4>
                          <p className="text-sm text-muted-foreground">{challengeData.description}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress: {challenge.progress}/{total}</span>
                              <span className="text-muted-foreground">{challenge.timeRemaining} left</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          +{challengeData.pointsReward} pts
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ACHIEVEMENT_DEFINITIONS).map(([key, achievement]) => {
              const userAch = userAchievements.find(ua => ua.achievementId === key);
              const progressData = checkAchievementProgress(key, userStats);
              
              return (
                <AchievementCard
                  key={key}
                  achievement={{ ...achievement, id: key, createdAt: new Date() }}
                  userAchievement={userAch as any}
                  progress={progressData.progress}
                  total={progressData.total}
                  isCompleted={progressData.isCompleted || !!userAch}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Daily Challenges
                </CardTitle>
                <CardDescription>Reset every 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(DAILY_CHALLENGES).map(([key, challenge]) => (
                  <div key={key} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{challenge.name}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <Badge variant="secondary">+{challenge.pointsReward}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Weekly Challenges
                </CardTitle>
                <CardDescription>Reset every Monday</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(WEEKLY_CHALLENGES).map(([key, challenge]) => (
                  <div key={key} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{challenge.name}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <Badge variant="secondary">+{challenge.pointsReward}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top contributors across all groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock leaderboard data */}
                {[
                  { rank: 1, name: "CryptoSaver", points: 5420, streak: 45 },
                  { rank: 2, name: "BlockchainBuddy", points: 4890, streak: 32 },
                  { rank: 3, name: "DeFiDreamer", points: 4650, streak: 28 },
                  { rank: 4, name: "TokenTrader", points: 4200, streak: 25 },
                  { rank: 5, name: "Web3Winner", points: 3980, streak: 22 },
                ].map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.rank}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.streak} day streak
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.points.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}