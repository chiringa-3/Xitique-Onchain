import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, CreditCard, Calendar, UserPlus } from "lucide-react";
import { Group } from "@shared/schema";

interface GroupCardProps {
  group: Group;
  memberCount: number;
  currentCycle?: number;
  totalCycles?: number;
  nextContribution?: string;
  onViewDetails: () => void;
  onContribute?: () => void;
  onInvite?: () => void;
}

export function GroupCard({
  group,
  memberCount,
  currentCycle = 1,
  totalCycles = 10,
  nextContribution,
  onViewDetails,
  onContribute,
  onInvite,
}: GroupCardProps) {
  const cycleProgress = totalCycles > 0 ? (currentCycle / totalCycles) * 100 : 0;
  
  const statusColors = {
    active: "bg-secondary/10 text-secondary",
    pending: "bg-accent/10 text-accent",
    finished: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };

  const getGradientColors = (symbol: string) => {
    const colors = [
      "from-primary to-blue-600",
      "from-secondary to-green-600", 
      "from-accent to-yellow-600",
      "from-purple-500 to-pink-600",
      "from-red-500 to-orange-600",
    ];
    const index = (symbol?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getGradientColors(group.symbol || '')} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">
                {group.symbol || group.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {memberCount}/{group.maxParticipants} members
              </p>
            </div>
          </div>
          <Badge className={statusColors[group.status as keyof typeof statusColors]}>
            {group.status}
          </Badge>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Contribution Amount</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {group.contributionAmt} USDT
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Frequency</span>
            <span className="font-semibold text-gray-900 dark:text-white capitalize">
              {group.frequency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Cycle</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {currentCycle} of {totalCycles}
            </span>
          </div>
        </div>
        
        {/* Cycle Progress */}
        {group.status === "active" && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cycle Progress</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(cycleProgress)}%
              </span>
            </div>
            <Progress value={cycleProgress} className="h-2" />
          </div>
        )}
        
        {/* Next Contribution or Status */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {group.status === "active" ? "Next Contribution" : "Status"}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {group.status === "active" 
                ? nextContribution || "TBD"
                : group.status === "pending" 
                ? "Waiting for members"
                : "Complete"
              }
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={onViewDetails}
            className="flex-1 bg-primary text-white hover:bg-primary/90 flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Button>
          
          {group.status === "active" && onContribute && (
            <Button 
              variant="outline"
              onClick={onContribute}
              className="px-4 py-2"
            >
              <CreditCard className="w-4 h-4" />
            </Button>
          )}
          
          {group.status === "pending" && onInvite && (
            <Button 
              variant="outline"
              onClick={onInvite}
              className="px-4 py-2"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
