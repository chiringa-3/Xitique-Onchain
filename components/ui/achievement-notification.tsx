import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Achievement } from "@shared/schema";
import { RARITY_STYLES, generateFireworks } from "@/lib/rewards";
import { cn } from "@/lib/utils";

interface AchievementNotificationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  pointsEarned: number;
}

export function AchievementNotification({
  achievement,
  isVisible,
  onClose,
  pointsEarned,
}: AchievementNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const rarity = achievement.rarity as keyof typeof RARITY_STYLES;
  const styles = RARITY_STYLES[rarity];

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Trigger fireworks for epic and legendary achievements
      if (rarity === 'epic' || rarity === 'legendary') {
        setTimeout(generateFireworks, 500);
      }
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, rarity, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card 
        className={cn(
          "relative overflow-hidden max-w-sm w-full transform transition-all duration-500",
          styles.borderColor,
          styles.glowEffect,
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <div className={cn("absolute inset-0", styles.bgGradient)} />
        
        <CardContent className="relative p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-6 w-6 p-0"
            data-testid="button-close-notification"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-4">
            {/* Achievement Icon */}
            <div className={cn(
              "mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl",
              "bg-white/20 backdrop-blur-sm"
            )}>
              {achievement.icon}
            </div>

            {/* Achievement Details */}
            <div>
              <div className="mb-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium capitalize mb-2",
                    achievement.badgeColor
                  )}
                  data-testid="badge-achievement-rarity"
                >
                  {rarity} Achievement
                </Badge>
              </div>
              
              <h3 className={cn(
                "text-xl font-bold mb-2",
                styles.textColor
              )} data-testid="text-achievement-name">
                {achievement.name}
              </h3>
              
              <p className={cn(
                "text-sm opacity-80 mb-4",
                styles.textColor
              )} data-testid="text-achievement-description">
                {achievement.description}
              </p>

              {/* Points Earned */}
              <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold">
                <span className="text-2xl">⭐</span>
                <span className="text-lg" data-testid="text-points-earned">
                  +{pointsEarned} Points!
                </span>
              </div>
            </div>

            {/* Celebration Text */}
            <div className={cn(
              "text-lg font-semibold",
              styles.textColor
            )}>
              🎉 Achievement Unlocked! 🎉
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}