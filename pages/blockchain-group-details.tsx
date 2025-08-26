import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { CycleManagement } from "@/components/ui/cycle-management";
import { GovernancePanel } from "@/components/ui/governance-panel";
import { 
  xitiqueContractService, 
  ContractGroupInfo, 
  CycleInfo,
  GroupStatus 
} from "@/lib/contract";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  DollarSign, 
  Trophy,
  ExternalLink,
  RefreshCw,
  Settings
} from "lucide-react";

export default function BlockchainGroupDetails() {
  const [, params] = useRoute("/blockchain/group/:contractAddress");
  const contractAddress = params?.contractAddress;
  
  const [groupInfo, setGroupInfo] = useState<ContractGroupInfo | null>(null);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [isUserMember, setIsUserMember] = useState(false);
  const [hasUserContributed, setHasUserContributed] = useState(false);
  const [userReputationScore, setUserReputationScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isConnected, address, connect } = useWallet();
  const { toast } = useToast();

  const loadGroupData = async () => {
    if (!contractAddress || !address || !isConnected) return;

    try {
      setIsRefreshing(true);
      await xitiqueContractService.connectToContract(contractAddress);
      
      const [info, cycle, membersList, isMember, reputation] = await Promise.all([
        xitiqueContractService.getGroupInfo(),
        xitiqueContractService.getCurrentCycleInfo(),
        xitiqueContractService.getMembers(),
        xitiqueContractService.isMember(address),
        xitiqueContractService.getReputationScore(address),
      ]);

      let hasContributed = false;
      if (cycle && isMember) {
        hasContributed = await xitiqueContractService.hasContributed(address);
      }

      setGroupInfo(info);
      setCycleInfo(cycle);
      setMembers(membersList);
      setIsUserMember(isMember);
      setHasUserContributed(hasContributed);
      setUserReputationScore(reputation);
    } catch (error: any) {
      console.error("Failed to load group data:", error);
      toast({
        title: "Load Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  useEffect(() => {
    if (contractAddress && isConnected) {
      loadGroupData();
    }
  }, [contractAddress, address, isConnected]);

  const handleRefresh = () => {
    loadGroupData();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Web3 wallet to view group details
              </p>
              <Button onClick={connect}>Connect Wallet</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !groupInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading group details...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/blockchain">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {groupInfo.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {groupInfo.symbol} • Contract: {contractAddress?.slice(0, 10)}...{contractAddress?.slice(-6)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusColors[groupInfo.status]}>
              {statusLabels[groupInfo.status]}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Group Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-lg font-semibold">
                    {groupInfo.totalMembers}/{groupInfo.maxParticipants}
                  </div>
                  <div className="text-xs text-muted-foreground">Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-lg font-semibold">{groupInfo.contributionAmount}</div>
                  <div className="text-xs text-muted-foreground">USDT per cycle</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-lg font-semibold">{groupInfo.frequencyDays}</div>
                  <div className="text-xs text-muted-foreground">Day frequency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-lg font-semibold">{userReputationScore}</div>
                  <div className="text-xs text-muted-foreground">Your reputation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cycle" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cycle">Current Cycle</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="cycle" className="space-y-6">
            {cycleInfo ? (
              <CycleManagement
                cycleInfo={cycleInfo}
                members={members}
                userAddress={address!}
                isUserMember={isUserMember}
                hasUserContributed={hasUserContributed}
                userReputationScore={userReputationScore}
                onRefresh={handleRefresh}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Cycle</h3>
                  <p className="text-muted-foreground mb-4">
                    {groupInfo.totalMembers < 2 
                      ? "Group needs at least 2 members to start"
                      : "The group creator needs to start the first cycle"
                    }
                  </p>
                  {address && address.toLowerCase() === groupInfo.creator.toLowerCase() && 
                   groupInfo.totalMembers >= 2 && (
                    <p className="text-sm text-blue-600">
                      You can start the first cycle from the dashboard
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Members ({members.length})</CardTitle>
                <CardDescription>
                  All members of this savings group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div key={member} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {member.slice(0, 10)}...{member.slice(-6)}
                          </code>
                          {member.toLowerCase() === address?.toLowerCase() && (
                            <Badge variant="outline" className="ml-2">You</Badge>
                          )}
                          {member.toLowerCase() === groupInfo.creator.toLowerCase() && (
                            <Badge variant="outline" className="ml-2">Creator</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {cycleInfo && (
                          <div>
                            Contributed: {hasUserContributed ? "✅" : "❌"}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(member);
                            toast({
                              title: "Copied",
                              description: "Address copied to clipboard",
                            });
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <GovernancePanel
              members={members}
              userAddress={address!}
              isUserMember={isUserMember}
              activeMembersCount={groupInfo.activeMembersCount}
            />
          </TabsContent>
        </Tabs>

        {/* Contract Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Contract Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Contract Address:</span>
                <code className="ml-2 bg-muted px-1 rounded">{contractAddress}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Creator:</span>
                <code className="ml-2 bg-muted px-1 rounded">
                  {groupInfo.creator.slice(0, 10)}...{groupInfo.creator.slice(-6)}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}