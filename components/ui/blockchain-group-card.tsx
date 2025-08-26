import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Clock, 
  DollarSign, 
  Trophy, 
  Vote, 
  Gavel, 
  Dice6,
  ArrowRight,
  Zap
} from "lucide-react";
import { ContractGroupInfo, CycleInfo, SelectionMode, GroupStatus } from "@/lib/contract";

interface BlockchainGroupCardProps {
  groupInfo: ContractGroupInfo;
  cycleInfo?: CycleInfo | null;
  userAddress?: string;
  onJoin?: () => void;
  onContribute?: () => void;
  onStartCycle?: (mode: SelectionMode) => void;
  onViewDetails?: () => void;
  isUserMember?: boolean;
  hasUserContributed?: boolean;
}

const selectionModeLabels = {
  [SelectionMode.Rotation]: "Rotation",
  [SelectionMode.Auction]: "Auction", 
  [SelectionMode.Vote]: "Vote",
  [SelectionMode.Lottery]: "Lottery",
};

const selectionModeIcons = {
  [SelectionMode.Rotation]: ArrowRight,
  [SelectionMode.Auction]: Gavel,
  [SelectionMode.Vote]: Vote,
  [SelectionMode.Lottery]: Dice6,
};

const statusLabels = {
  [GroupStatus.Active]: "Active",
  [GroupStatus.Paused]: "Paused", 
  [GroupStatus.Ended]: "Ended",
};

const statusColors = {
  [GroupStatus.Active]: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  [GroupStatus.Paused]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  [GroupStatus.Ended]: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
};

export function BlockchainGroupCard({
  groupInfo,
  cycleInfo,
  userAddress,
  onJoin,
  onContribute,
  onStartCycle,
  onViewDetails,
  isUserMember = false,
  hasUserContributed = false,
}: BlockchainGroupCardProps) {
  const [selectedMode, setSelectedMode] = useState<SelectionMode>(SelectionMode.Rotation);
  
  const isCreator = userAddress && userAddress.toLowerCase() === groupInfo.creator.toLowerCase();
  const needsFirstCycle = !cycleInfo && groupInfo.totalMembers >= 2;
  const canContribute = isUserMember && cycleInfo && !cycleInfo.finalized && !hasUserContributed;
  const canJoin = !isUserMember && groupInfo.totalMembers < groupInfo.maxParticipants;
  
  // Calculate time remaining for cycle
  const timeRemaining = cycleInfo ? Math.max(0, cycleInfo.dueTime * 1000 - Date.now()) : 0;
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // Calculate progress
  const memberProgress = (groupInfo.totalMembers / groupInfo.maxParticipants) * 100;
  const contributionProgress = cycleInfo ? (cycleInfo.contributors / groupInfo.activeMembersCount) * 100 : 0;

  const SelectionModeIcon = cycleInfo ? selectionModeIcons[cycleInfo.selectionMode] : ArrowRight;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="truncate">{groupInfo.name}</span>
              <Badge className={statusColors[groupInfo.status]}>
                {statusLabels[groupInfo.status]}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {groupInfo.symbol} • {groupInfo.contributionAmount} USDT per {groupInfo.frequencyDays} days
            </CardDescription>
          </div>
          {cycleInfo && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <SelectionModeIcon className="w-4 h-4" />
              <span>{selectionModeLabels[cycleInfo.selectionMode]}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Group Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">
              {groupInfo.totalMembers}/{groupInfo.maxParticipants} members
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm text-muted-foreground">
              {groupInfo.contributionAmount} USDT
            </span>
          </div>
        </div>

        {/* Member Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Group Size</span>
            <span className="font-medium">{Math.round(memberProgress)}%</span>
          </div>
          <Progress value={memberProgress} className="h-2" />
        </div>

        {/* Current Cycle Info */}
        {cycleInfo && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cycle #{cycleInfo.id}</span>
              {!cycleInfo.finalized && timeRemaining > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {daysRemaining > 0 ? `${daysRemaining}d ${hoursRemaining}h` : `${hoursRemaining}h`} left
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contributions</span>
                <span className="font-medium">
                  {cycleInfo.contributors}/{groupInfo.activeMembersCount}
                </span>
              </div>
              <Progress value={contributionProgress} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pool Total</span>
              <span className="font-semibold text-primary">
                {cycleInfo.totalContributed} USDT
              </span>
            </div>

            {/* Auction-specific info */}
            {cycleInfo.selectionMode === SelectionMode.Auction && cycleInfo.highestBid !== "0.0" && (
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-muted-foreground">Highest bid:</span>
                <span className="font-semibold">{cycleInfo.highestBid} USDT</span>
              </div>
            )}

            {/* Finalization status */}
            {cycleInfo.finalized && cycleInfo.beneficiary !== "0x0000000000000000000000000000000000000000" && (
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">Winner:</span>
                <code className="text-xs bg-muted px-1 rounded">
                  {cycleInfo.beneficiary.slice(0, 6)}...{cycleInfo.beneficiary.slice(-4)}
                </code>
              </div>
            )}
          </div>
        )}

        {/* No cycle state */}
        {!cycleInfo && groupInfo.status === GroupStatus.Active && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Zap className="w-4 h-4" />
              {groupInfo.totalMembers < 2 
                ? "Waiting for more members to join"
                : needsFirstCycle 
                ? "Ready to start first cycle"
                : "Group not yet started"
              }
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Primary Actions */}
          <div className="flex gap-2">
            {canJoin && (
              <Button onClick={onJoin} className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Join Group
              </Button>
            )}
            
            {canContribute && (
              <Button onClick={onContribute} className="flex-1">
                <DollarSign className="w-4 h-4 mr-2" />
                Contribute {groupInfo.contributionAmount} USDT
              </Button>
            )}

            {isCreator && needsFirstCycle && onStartCycle && (
              <div className="flex gap-2 flex-1">
                <select 
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(Number(e.target.value) as SelectionMode)}
                  className="text-xs px-2 py-1 border rounded"
                >
                  <option value={SelectionMode.Rotation}>Rotation</option>
                  <option value={SelectionMode.Auction}>Auction</option>
                  <option value={SelectionMode.Vote}>Vote</option>
                  <option value={SelectionMode.Lottery}>Lottery</option>
                </select>
                <Button 
                  onClick={() => onStartCycle(selectedMode)}
                  size="sm"
                >
                  Start Cycle
                </Button>
              </div>
            )}
          </div>

          {/* Secondary Action */}
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails} className="w-full">
              View Details
            </Button>
          )}
        </div>

        {/* Member Status Indicator */}
        {isUserMember && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">You are a member</span>
            {hasUserContributed && (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                <span className="text-xs text-muted-foreground">Contributed this cycle</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}