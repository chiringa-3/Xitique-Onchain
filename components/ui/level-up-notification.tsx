import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Trophy, Star } from "lucide-react";
import { generateFireworks } from "@/lib/rewards";
import { cn } from "@/lib/utils";

interface LevelUpNotificationProps {
  oldLevel: number;
  newLevel: number;
  levelName: string;
  totalPoints: number;
  isVisible: boolean;
  onClose: () => void;
}

export function LevelUpNotification({
  oldLevel,
  newLevel,
  levelName,
  totalPoints,
  isVisible,
  onClose,
}: LevelUpNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Trigger fireworks for level up
      setTimeout(generateFireworks, 500);
      
      // Show progress animation after initial animation
      setTimeout(() => setShowProgress(true), 1000);
      
      // Auto-close after 6 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setShowProgress(false);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card 
        className={cn(
          "relative overflow-hidden max-w-md w-full transform transition-all duration-500",
          "border-yellow-300 shadow-yellow-200 shadow-xl",
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-100" />
        
        <CardContent className="relative p-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-6 w-6 p-0"
            data-testid="button-close-level-notification"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-6">
            {/* Level Up Animation */}
            <div className="relative">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              
              {/* Floating stars animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "absolute w-4 h-4 text-yellow-400 animate-bounce",
                      i % 2 === 0 ? "animate-pulse" : ""
                    )}
                    style={{
                      left: `${20 + (i * 12)}%`,
                      top: `${10 + (i % 3) * 20}%`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Level Up Text */}
            <div>
              <h2 className="text-3xl font-bold text-amber-800 mb-2" data-testid="text-level-up">
                🎉 LEVEL UP! 🎉
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-4 text-lg">
                  <span className="px-3 py-1 bg-white/50 rounded-full font-bold text-amber-700">
                    Level {oldLevel}
                  </span>
                  <span className="text-amber-600">→</span>
                  <span className="px-3 py-1 bg-amber-200 rounded-full font-bold text-amber-800">
                    Level {newLevel}
                  </span>
                </div>
                
                <p className="text-xl font-semibold text-amber-800" data-testid="text-level-name">
                  {levelName}
                </p>
              </div>
            </div>

            {/* Progress Animation */}
            {showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-amber-700">
                  <span>Total Points</span>
                  <span data-testid="text-total-points">{totalPoints.toLocaleString()}</span>
                </div>
                <Progress 
                  value={100} 
                  className="h-3 bg-amber-100"
                  data-testid="progress-level-complete"
                />
                <p className="text-xs text-amber-600">
                  You've earned new privileges and recognition!
                </p>
              </div>
            )}

            {/* Rewards Preview */}
            <div className="bg-white/30 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-amber-800">New Level Benefits:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Enhanced profile badge</li>
                <li>• Increased reputation multiplier</li>
                <li>• Access to exclusive challenges</li>
                <li>• Priority in group selections</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}