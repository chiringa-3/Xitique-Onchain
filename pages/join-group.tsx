import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { Users, Calendar, DollarSign, ArrowLeft, ExternalLink } from "lucide-react";
import type { Group } from "@shared/schema";

export default function JoinGroup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isConnected, address, connect } = useWallet();
  const queryClient = useQueryClient();

  // Parse URL parameters - supports both /join?group=ID and /invite/:groupId
  const [, routeParams] = useRoute("/invite/:groupId");
  const groupId = routeParams?.groupId || new URLSearchParams(window.location.search).get('group');

  const [isJoining, setIsJoining] = useState(false);

  // Fetch group details
  const { data: group, isLoading, error } = useQuery<Group>({
    queryKey: ["/api/groups", groupId],
    enabled: !!groupId,
  });

  // Fetch group members to check capacity
  const { data: members } = useQuery<any[]>({
    queryKey: ["/api/groups", groupId, "members"],
    enabled: !!groupId,
  });

  // Check if user is already a member
  const { data: userGroups } = useQuery<Group[]>({
    queryKey: ["/api/users", address, "groups"],
    enabled: !!address,
  });

  const isAlreadyMember = userGroups?.some(userGroup => userGroup.id === groupId);
  const isFull = members && group && members.length >= group.maxParticipants;

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      if (!address || !groupId) {
        throw new Error("Wallet not connected or invalid group");
      }

      // Find or create user
      let user;
      try {
        const userResponse = await apiRequest("GET", `/api/users/wallet/${address}`);
        user = await userResponse.json();
      } catch {
        // User doesn't exist, create them
        const createResponse = await apiRequest("POST", "/api/users", {
          walletAddress: address,
          username: `User ${address.slice(-8)}`,
        });
        user = await createResponse.json();
      }

      // Add user to group
      const response = await apiRequest("POST", `/api/groups/${groupId}/members`, {
        userId: user.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You have successfully joined the group.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", address, "groups"] });
      // Redirect to group details
      setLocation(`/groups/${groupId}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Join",
        description: error.message,
      });
    },
  });

  const handleJoinGroup = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    setIsJoining(true);
    try {
      await joinGroupMutation.mutateAsync();
    } finally {
      setIsJoining(false);
    }
  };

  if (!groupId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This invitation link is not valid or has expired.
            </p>
            <Button onClick={() => setLocation('/groups')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Group Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The group you're trying to join doesn't exist or is no longer available.
            </p>
            <Button onClick={() => setLocation('/groups')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/groups')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join Savings Group
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You've been invited to join this savings group
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {group.symbol || group.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created by User {group.creatorId.slice(-8)}
                    </p>
                  </div>
                </div>
                <Badge className={
                  group.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                  group.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" :
                  "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }>
                  {group.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {group.description}
                </p>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contribution</p>
                    <p className="font-semibold">{group.contributionAmt} USDT</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Frequency</p>
                    <p className="font-semibold capitalize">{group.frequency}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                    <p className="font-semibold">
                      {members?.length || 0}/{group.maxParticipants}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-semibold">
                      {group.isPublic ? "Public" : "Private"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center space-y-4">
                {isAlreadyMember ? (
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                      ✓ You're already a member of this group
                    </p>
                    <Button onClick={() => setLocation(`/groups/${groupId}`)}>
                      View Group Details
                    </Button>
                  </div>
                ) : isFull ? (
                  <div>
                    <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                      This group is full and cannot accept new members
                    </p>
                    <Button onClick={() => setLocation('/groups')}>
                      Browse Other Groups
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {!isConnected 
                        ? "Connect your wallet to join this savings group"
                        : "Ready to join this savings group?"
                      }
                    </p>
                    <Button 
                      size="lg"
                      onClick={handleJoinGroup}
                      disabled={isJoining || joinGroupMutation.isPending}
                      data-testid="button-join-group"
                    >
                      {isJoining || joinGroupMutation.isPending ? (
                        "Joining..."
                      ) : !isConnected ? (
                        "Connect Wallet & Join"
                      ) : (
                        "Join Group"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {group.contractAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Blockchain Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Smart Contract: {group.contractAddress}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Network: Hedera Testnet
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}