import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  DollarSign, 
  Users, 
  Trophy, 
  Vote, 
  Gavel,
  Dice6,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";
import { CycleInfo, SelectionMode, xitiqueContractService } from "@/lib/contract";

interface CycleManagementProps {
  cycleInfo: CycleInfo;
  members: string[];
  userAddress: string;
  isUserMember: boolean;
  hasUserContributed: boolean;
  userReputationScore: number;
  onRefresh: () => void;
}

const selectionModeLabels = {
  [SelectionMode.Rotation]: "Fixed Rotation",
  [SelectionMode.Auction]: "Highest Bidder", 
  [SelectionMode.Vote]: "Member Vote",
  [SelectionMode.Lottery]: "Random Lottery",
};

const selectionModeIcons = {
  [SelectionMode.Rotation]: Users,
  [SelectionMode.Auction]: Gavel,
  [SelectionMode.Vote]: Vote,
  [SelectionMode.Lottery]: Dice6,
};

export function CycleManagement({ 
  cycleInfo, 
  members, 
  userAddress, 
  isUserMember,
  hasUserContributed,
  userReputationScore,
  onRefresh 
}: CycleManagementProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [selectedNominee, setSelectedNominee] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calculate time remaining
  const timeRemaining = Math.max(0, cycleInfo.dueTime * 1000 - Date.now());
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const isOverdue = timeRemaining === 0;
  
  // Calculate progress
  const totalMembers = members.length;
  const contributionProgress = totalMembers > 0 ? (cycleInfo.contributors / totalMembers) * 100 : 0;

  const SelectionIcon = selectionModeIcons[cycleInfo.selectionMode];

  const handleContribute = async () => {
    try {
      setIsLoading(true);
      
      // First approve USDT spending
      await xitiqueContractService.approveUSDT("1000"); // Approve large amount
      toast({
        title: "USDT Approved",
        description: "Proceeding with contribution...",
      });
      
      // Then contribute
      const txHash = await xitiqueContractService.contribute();
      toast({
        title: "Contribution Successful",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Contribution Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= parseFloat(cycleInfo.highestBid)) {
      toast({
        title: "Invalid Bid",
        description: "Bid must be higher than current highest bid",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // First approve USDT for bid
      await xitiqueContractService.approveUSDT(bidAmount);
      toast({
        title: "USDT Approved",
        description: "Proceeding with bid...",
      });
      
      // Then place bid
      const txHash = await xitiqueContractService.placeBid(bidAmount);
      toast({
        title: "Bid Placed",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      setBidAmount("");
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Bid Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCastVote = async () => {
    if (!selectedNominee) {
      toast({
        title: "No Nominee Selected",
        description: "Please select a member to vote for",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const txHash = await xitiqueContractService.castVote(selectedNominee);
      toast({
        title: "Vote Cast",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      setSelectedNominee("");
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Vote Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizePayout = async () => {
    try {
      setIsLoading(true);
      const txHash = await xitiqueContractService.finalizeAndPayout();
      toast({
        title: "Payout Finalized",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Finalization Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cycle Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SelectionIcon className="w-5 h-5" />
                Cycle #{cycleInfo.id}
              </CardTitle>
              <CardDescription>
                {selectionModeLabels[cycleInfo.selectionMode]} • 
                {cycleInfo.finalized ? " Completed" : isOverdue ? " Overdue" : " In Progress"}
              </CardDescription>
            </div>
            <div className="text-right">
              {!cycleInfo.finalized && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {isOverdue 
                    ? "Overdue" 
                    : daysRemaining > 0 
                    ? `${daysRemaining}d ${hoursRemaining}h left`
                    : `${hoursRemaining}h left`
                  }
                </div>
              )}
              <div className="text-lg font-semibold text-primary">
                {cycleInfo.totalContributed} USDT Pool
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Contributions</span>
              <span className="font-medium">
                {cycleInfo.contributors}/{totalMembers} members
              </span>
            </div>
            <Progress value={contributionProgress} className="h-3" />
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">{cycleInfo.contributors}</div>
                <div className="text-xs text-muted-foreground">Contributors</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">{cycleInfo.totalContributed}</div>
                <div className="text-xs text-muted-foreground">Total USDT</div>
              </div>
            </div>

            {cycleInfo.selectionMode === SelectionMode.Auction && (
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium">{cycleInfo.highestBid}</div>
                  <div className="text-xs text-muted-foreground">Highest Bid</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {hasUserContributed ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-600" />
              )}
              <div>
                <div className="text-sm font-medium">
                  {hasUserContributed ? "Done" : "Pending"}
                </div>
                <div className="text-xs text-muted-foreground">Your Status</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Actions */}
      {isUserMember && !cycleInfo.finalized && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Your reputation score: {userReputationScore}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contribute */}
            {!hasUserContributed && (
              <div className="space-y-3">
                <Button 
                  onClick={handleContribute}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  {isLoading ? "Contributing..." : "Make Contribution"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You need to contribute to participate in this cycle
                </p>
              </div>
            )}

            <Separator />

            {/* Mode-specific actions */}
            {cycleInfo.selectionMode === SelectionMode.Auction && hasUserContributed && (
              <div className="space-y-3">
                <Label htmlFor="bid-amount">Place Auction Bid</Label>
                <div className="flex gap-2">
                  <Input
                    id="bid-amount"
                    type="number"
                    placeholder={`Min: ${parseFloat(cycleInfo.highestBid) + 1}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handlePlaceBid}
                    disabled={isLoading || !bidAmount}
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    Bid
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current highest: {cycleInfo.highestBid} USDT
                  {cycleInfo.highestBidder !== "0x0000000000000000000000000000000000000000" && (
                    <span> by {cycleInfo.highestBidder.slice(0, 6)}...{cycleInfo.highestBidder.slice(-4)}</span>
                  )}
                </p>
              </div>
            )}

            {cycleInfo.selectionMode === SelectionMode.Vote && hasUserContributed && (
              <div className="space-y-3">
                <Label htmlFor="nominee">Vote for Beneficiary</Label>
                <div className="flex gap-2">
                  <select
                    id="nominee"
                    value={selectedNominee}
                    onChange={(e) => setSelectedNominee(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member} value={member}>
                        {member.slice(0, 6)}...{member.slice(-4)}
                        {member.toLowerCase() === userAddress.toLowerCase() && " (You)"}
                      </option>
                    ))}
                  </select>
                  <Button 
                    onClick={handleCastVote}
                    disabled={isLoading || !selectedNominee}
                  >
                    <Vote className="w-4 h-4 mr-2" />
                    Vote
                  </Button>
                </div>
              </div>
            )}

            {/* Finalize payout (available to anyone when conditions met) */}
            {contributionProgress >= 100 && !isOverdue && (
              <div className="space-y-3 pt-4 border-t">
                <Button 
                  onClick={handleFinalizePayout}
                  disabled={isLoading}
                  variant="default"
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isLoading ? "Finalizing..." : "Finalize & Distribute Payout"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  All contributions are in. Finalize the cycle and distribute the payout.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Winner Announcement */}
      {cycleInfo.finalized && cycleInfo.beneficiary !== "0x0000000000000000000000000000000000000000" && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cycle Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Winner: <code className="text-xs bg-muted px-1 rounded">
                    {cycleInfo.beneficiary.slice(0, 10)}...{cycleInfo.beneficiary.slice(-6)}
                  </code>
                </p>
                <p className="text-lg font-semibold text-green-600 mt-2">
                  Payout: {cycleInfo.totalContributed} USDT
                  {cycleInfo.selectionMode === SelectionMode.Auction && cycleInfo.highestBid !== "0.0" && (
                    <span> + {cycleInfo.highestBid} USDT bid</span>
                  )}
                </p>
              </div>
              {cycleInfo.beneficiary.toLowerCase() === userAddress.toLowerCase() && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  🎉 You won this cycle!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}