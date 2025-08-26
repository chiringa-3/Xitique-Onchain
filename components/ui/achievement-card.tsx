import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Achievement, UserAchievement } from "@shared/schema";
import { RARITY_STYLES } from "@/lib/rewards";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  progress?: number;
  total?: number;
  isCompleted?: boolean;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export function AchievementCard({
  achievement,
  userAchievement,
  progress = 0,
  total = 1,
  isCompleted = false,
  size = "md",
  showProgress = true,
}: AchievementCardProps) {
  const rarity = achievement.rarity as keyof typeof RARITY_STYLES;
  const styles = RARITY_STYLES[rarity];
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;
  
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };
  
  const iconSizes = {
    sm: "text-2xl",
    md: "text-3xl", 
    lg: "text-4xl",
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105",
        styles.borderColor,
        styles.glowEffect,
        isCompleted ? "opacity-100" : "opacity-75"
      )}
    >
      <div className={cn("absolute inset-0", styles.bgGradient)} />
      
      <CardContent className={cn("relative", sizeClasses[size])}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full",
            isCompleted ? "bg-white/20" : "bg-white/10",
            iconSizes[size]
          )}>
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={cn(
                  "font-semibold leading-tight",
                  styles.textColor,
                  size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
                )}>
                  {achievement.name}
                </h3>
                <p className={cn(
                  "text-xs opacity-75 mt-1",
                  styles.textColor
                )}>
                  {achievement.description}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium capitalize",
                    achievement.badgeColor
                  )}
                  data-testid={`badge-rarity-${rarity}`}
                >
                  {rarity}
                </Badge>
                
                <div className="flex items-center gap-1 text-xs font-medium text-yellow-600">
                  <span>⭐</span>
                  <span data-testid="text-points">{achievement.pointsReward}</span>
                </div>
              </div>
            </div>
            
            {showProgress && !isCompleted && total > 1 && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs opacity-75">
                  <span>Progress</span>
                  <span data-testid="text-progress">{progress}/{total}</span>
                </div>
                <Progress 
                  value={progressPercent} 
                  className="h-2"
                  data-testid="progress-achievement"
                />
              </div>
            )}
            
            {isCompleted && userAchievement && userAchievement.earnedAt && (
              <div className="mt-2 flex items-center gap-1 text-xs opacity-75">
                <span>🎉</span>
                <span data-testid="text-earned-date">
                  Earned {new Date(userAchievement.earnedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {isCompleted && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}