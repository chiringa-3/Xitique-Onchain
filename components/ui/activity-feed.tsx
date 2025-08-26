import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  Coins, 
  Users, 
  Trophy, 
  Vote, 
  Target, 
  Star,
  Gift,
  Zap,
  Award
} from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityLog[];
  maxItems?: number;
  showPoints?: boolean;
  className?: string;
}

// Mock activity data for demonstration
const mockActivities: ActivityLog[] = [
  {
    id: "1",
    userId: "user-1",
    groupId: "group-1",
    activityType: "join_group",
    pointsEarned: 50,
    metadata: '{"groupName": "Monthly Savers"}',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "2", 
    userId: "user-1",
    groupId: "group-1",
    activityType: "contribute",
    pointsEarned: 25,
    metadata: '{"amount": "100", "onTime": true}',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "3",
    userId: "user-1",
    groupId: "group-2",
    activityType: "win_cycle",
    pointsEarned: 200,
    metadata: '{"groupName": "Weekly Contributors", "payout": "500"}',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "4",
    userId: "user-1",
    groupId: null,
    activityType: "achievement_earned",
    pointsEarned: 100,
    metadata: '{"achievementName": "Early Bird", "rarity": "common"}',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: "5",
    userId: "user-1",
    groupId: "group-1",
    activityType: "vote",
    pointsEarned: 15,
    metadata: '{"proposalType": "Change Rules"}',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
];

const activityConfig = {
  join_group: {
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    label: "Joined Group",
    getDescription: (metadata: any) => `Joined "${metadata.groupName}"`,
  },
  contribute: {
    icon: Coins,
    color: "text-green-500", 
    bgColor: "bg-green-100",
    label: "Made Contribution",
    getDescription: (metadata: any) => 
      `Contributed ${metadata.amount} USDT ${metadata.onTime ? '(On time!)' : ''}`,
  },
  win_cycle: {
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100", 
    label: "Won Cycle",
    getDescription: (metadata: any) => 
      `Won ${metadata.payout} USDT from "${metadata.groupName}"`,
  },
  vote: {
    icon: Vote,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    label: "Voted",
    getDescription: (metadata: any) => `Voted on ${metadata.proposalType} proposal`,
  },
  achievement_earned: {
    icon: Award,
    color: "text-amber-500",
    bgColor: "bg-amber-100",
    label: "Achievement Unlocked",
    getDescription: (metadata: any) => 
      `Earned "${metadata.achievementName}" achievement`,
  },
  challenge_completed: {
    icon: Target,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
    label: "Challenge Complete",
    getDescription: (metadata: any) => `Completed "${metadata.challengeName}"`,
  },
  streak_milestone: {
    icon: Zap,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    label: "Streak Milestone",
    getDescription: (metadata: any) => `Reached ${metadata.days} day streak!`,
  },
  bonus_earned: {
    icon: Gift,
    color: "text-pink-500",
    bgColor: "bg-pink-100",
    label: "Bonus Earned",
    getDescription: (metadata: any) => `Earned ${metadata.reason} bonus`,
  },
};

export function ActivityFeed({ 
  activities = mockActivities, 
  maxItems = 10, 
  showPoints = true,
  className = ""
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest actions and rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {displayedActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start participating to see your activity here!</p>
              </div>
            ) : (
              displayedActivities.map((activity) => {
                const config = activityConfig[activity.activityType as keyof typeof activityConfig];
                if (!config) return null;

                const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
                const Icon = config.icon;

                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    data-testid={`activity-${activity.activityType}`}
                  >
                    <div className={`p-2 rounded-full ${config.bgColor}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm" data-testid="text-activity-label">
                            {config.label}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid="text-activity-description">
                            {config.getDescription(metadata)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1" data-testid="text-activity-time">
                            {activity.timestamp ? formatDistanceToNow(activity.timestamp, { addSuffix: true }) : 'Just now'}
                          </p>
                        </div>
                        
                        {showPoints && activity.pointsEarned && activity.pointsEarned > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs font-medium bg-yellow-100 text-yellow-800"
                            data-testid="badge-points-earned"
                          >
                            +{activity.pointsEarned} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}