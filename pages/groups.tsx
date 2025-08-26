import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/ui/navigation";
import { GroupCard } from "@/components/ui/group-card";
import { CreateGroupModal } from "@/components/ui/create-group-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Users } from "lucide-react";

export default function Groups() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const currentUserId = address ? address : null;

  // Fetch public groups
  const { data: publicGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/groups/public"],
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

  const handleJoinGroup = (groupId: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join a group",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Feature Coming Soon",
      description: "Group joining feature will be available soon",
    });
  };

  const handleViewGroup = (groupId: string) => {
    setLocation(`/groups/${groupId}`);
  };

  const filteredGroups = (publicGroups as any[]).filter((group: any) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Groups</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Discover and join savings groups in your community
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={handleCreateGroup}
                className="bg-primary text-white hover:bg-primary/90 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Group</span>
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search groups by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Public Groups ({filteredGroups.length})
            </h2>
          </div>
          
          {groupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? "No groups found" : "No public groups yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery 
                    ? `No groups match "${searchQuery}". Try a different search term.`
                    : "Be the first to create a public savings group in the community."
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateGroup}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Group
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group: any) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  memberCount={Math.floor(Math.random() * (group.maxParticipants - 1)) + 1}
                  currentCycle={group.status === "active" ? Math.floor(Math.random() * 3) + 1 : 0}
                  totalCycles={group.maxParticipants}
                  nextContribution={group.status === "active" ? `${Math.floor(Math.random() * 7) + 1} days` : undefined}
                  onViewDetails={() => handleViewGroup(group.id)}
                  onContribute={undefined} // Can't contribute to groups you're not a member of
                  onInvite={group.status === "pending" ? () => handleJoinGroup(group.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Information Section */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How Xitique Groups Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <h4 className="font-medium mb-1">1. Join or Create</h4>
                <p>Find a group that matches your savings goals or create your own with custom parameters.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">2. Contribute Regularly</h4>
                <p>Make scheduled contributions using your Web3 wallet. All transactions are transparent on-chain.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">3. Receive Payouts</h4>
                <p>Take turns receiving the pooled funds through lottery, voting, or bidding mechanisms.</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
