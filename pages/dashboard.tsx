import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/ui/navigation";
import { StatsCard } from "@/components/ui/stats-card";
import { GroupCard } from "@/components/ui/group-card";
import { ActivityItem } from "@/components/ui/activity-item";
import { NFTCard } from "@/components/ui/nft-card";
import { CreateGroupModal } from "@/components/ui/create-group-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  PiggyBank, 
  Star, 
  Image, 
  Plus, 
  Search, 
  ArrowUp, 
  Gift, 
  Calendar 
} from "lucide-react";
import type { Group } from "@shared/schema";

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isConnected, address, connect } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Mock user ID based on wallet address
  const currentUserId = address ? `user-${address.slice(-8)}` : null;

  // Redirect to connect wallet if not connected
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/users", currentUserId, "stats"],
    enabled: !!currentUserId,
  });

  // Fetch user groups
  const { data: userGroups = [], isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ["/api/users", currentUserId, "groups"],
    enabled: !!currentUserId,
  });

  const handleCreateGroup = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a group",
        variant: "destructive",
      });
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleJoinGroup = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required", 
        description: "Please connect your wallet to join a group",
        variant: "destructive",
      });
      return;
    }
    // Navigate to groups page in the future
    toast({
      title: "Feature Coming Soon",
      description: "Group discovery feature will be available soon",
    });
  };

  const handleViewGroup = (groupId: string) => {
    setLocation(`/groups/${groupId}`);
  };

  const handleContribute = (groupId: string) => {
    toast({
      title: "Feature Coming Soon", 
      description: "Contribution feature will be available soon",
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Xitique</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect your Web3 wallet to start participating in savings groups
              </p>
              <Button onClick={connect} className="w-full">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section & Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "User"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your savings groups and track contributions
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={handleCreateGroup}
                className="bg-primary text-white hover:bg-primary/90 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Group</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleJoinGroup}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Join Group</span>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Groups"
              value={statsLoading ? "..." : (userStats as any)?.totalGroups || 0}
              icon={Users}
              iconBgColor="bg-primary/10"
              iconColor="text-primary"
            />
            <StatsCard
              title="Total Saved"
              value={statsLoading ? "..." : `${(userStats as any)?.totalSaved || 0} USDT`}
              icon={PiggyBank}
              iconBgColor="bg-secondary/10"
              iconColor="text-secondary"
            />
            <StatsCard
              title="Reputation Score"
              value={statsLoading ? "..." : (userStats as any)?.reputationScore || 0}
              icon={Star}
              iconBgColor="bg-accent/10"
              iconColor="text-accent"
            />
            <StatsCard
              title="NFTs Owned"
              value={statsLoading ? "..." : (userStats as any)?.nftsOwned || 0}
              icon={Image}
              iconBgColor="bg-purple-100 dark:bg-purple-900/20"
              iconColor="text-purple-600"
            />
          </div>
        </div>

        {/* Active Groups Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Active Groups</h2>
          
          {groupsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userGroups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Groups Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first savings group or join an existing one to get started.
                </p>
                <div className="flex space-x-3 justify-center">
                  <Button onClick={handleCreateGroup}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                  <Button variant="outline" onClick={handleJoinGroup}>
                    <Search className="w-4 h-4 mr-2" />
                    Join Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  memberCount={Math.floor(Math.random() * group.maxParticipants) + 1}
                  currentCycle={Math.floor(Math.random() * 5) + 1}
                  totalCycles={group.maxParticipants}
                  nextContribution={group.status === "active" ? "2 days" : undefined}
                  onViewDetails={() => handleViewGroup(group.id)}
                  onContribute={group.status === "active" ? () => handleContribute(group.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity & NFTs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                {userGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Join or create a group to see activity here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ActivityItem
                      icon={ArrowUp}
                      iconBgColor="bg-secondary/10"
                      iconColor="text-secondary"
                      title="You joined a new group"
                      timestamp="Just now"
                    />
                    <ActivityItem
                      icon={Gift}
                      iconBgColor="bg-purple-100 dark:bg-purple-900/20"
                      iconColor="text-purple-600"
                      title="Group participation NFT received"
                      timestamp="Just now"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* NFT Collection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your NFTs</h2>
            <Card>
              <CardContent className="p-6">
                {userGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No NFTs yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Participate in groups to earn NFTs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userGroups.slice(0, 2).map((group, index: number) => (
                      <NFTCard
                        key={group.id}
                        name={`Participation Token #${String(index + 1).padStart(3, '0')}`}
                        groupName={group.name}
                        reputationBoost={50 - index * 20}
                        gradientColors={index === 0 ? "from-primary via-purple-500 to-pink-500" : "from-secondary via-blue-500 to-cyan-500"}
                        icon={index === 0 ? "hexagon" : "star"}
                      />
                    ))}
                    
                    <Button variant="outline" className="w-full mt-4 text-sm">
                      View All NFTs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Create Group Modal */}
      {currentUserId && (
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
