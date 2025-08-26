import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Copy, 
  Share2, 
  UserPlus, 
  UserMinus, 
  Settings,
  ExternalLink,
  Crown,
  Check
} from "lucide-react";
import type { Group } from "@shared/schema";

interface MemberManagementProps {
  group: Group;
  currentUserId?: string;
}

interface GroupMember {
  id: string;
  userId: string;
  user: {
    id: string;
    walletAddress: string;
    username: string | null;
  };
  joinedAt: string;
  isActive: boolean;
}

export function MemberManagement({ group, currentUserId }: MemberManagementProps) {
  const { toast } = useToast();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const isCreator = currentUserId === group.creatorId || address?.toLowerCase() === group.creatorId.toLowerCase();

  // Fetch group members
  const { data: members, isLoading: membersLoading } = useQuery<GroupMember[]>({
    queryKey: ["/api/groups", group.id, "members"],
    enabled: !!group.id,
  });

  // Generate invitation link
  const inviteLink = `${window.location.origin}/invite/${group.id}`;

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      toast({
        title: "Link Copied!",
        description: "Invitation link has been copied to clipboard",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Copy",
        description: "Could not copy link to clipboard",
      });
    }
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${group.name} Savings Group`,
          text: `You've been invited to join "${group.name}" - a ${group.frequency} savings group with ${group.contributionAmt} USDT contributions.`,
          url: inviteLink,
        });
      } catch (error) {
        // User cancelled or sharing failed, fallback to copy
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  // Remove member mutation  
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiRequest("DELETE", `/api/groups/${group.id}/members/${memberId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Member Removed",
        description: "Member has been removed from the group",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group.id, "members"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Remove Member",
        description: error.message,
      });
    },
  });

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the group?")) {
      removeMemberMutation.mutate(memberId);
    }
  };

  if (membersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const memberCount = members?.length || 0;
  const spotsLeft = group.maxParticipants - memberCount;

  return (
    <div className="space-y-6">
      {/* Member Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Group Members</span>
            <Badge variant="secondary">
              {memberCount}/{group.maxParticipants}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{memberCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{spotsLeft}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spots Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite New Members */}
      {isCreator && spotsLeft > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Invite New Members</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Share this invitation link to add new members to your group:
              </p>
              <div className="flex space-x-2">
                <Input 
                  value={inviteLink} 
                  readOnly 
                  className="font-mono text-sm" 
                  data-testid="input-invite-link"
                />
                <Button 
                  variant="outline" 
                  onClick={copyInviteLink}
                  className="shrink-0"
                  data-testid="button-copy-link"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={shareInviteLink}
                  className="shrink-0"
                  data-testid="button-share-link"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Quick Actions</p>
              <div className="flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    window.open(`https://wa.me/?text=Join my savings group "${group.name}"! ${inviteLink}`, '_blank');
                  }}
                  data-testid="button-share-whatsapp"
                >
                  WhatsApp
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    window.open(`mailto:?subject=Join my savings group&body=You've been invited to join "${group.name}" savings group. Click here: ${inviteLink}`, '_blank');
                  }}
                  data-testid="button-share-email"
                >
                  Email
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=Join my savings group "${group.name}"! ${inviteLink}`, '_blank');
                  }}
                  data-testid="button-share-twitter"
                >
                  Twitter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Members</CardTitle>
        </CardHeader>
        <CardContent>
          {!members || members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const isCurrentUser = member.user.walletAddress.toLowerCase() === address?.toLowerCase();
                const isMemberCreator = member.userId === group.creatorId;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.user.username?.slice(0, 2).toUpperCase() || 
                           member.user.walletAddress.slice(2, 4).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {member.user.username || `User ${member.user.walletAddress.slice(-8)}`}
                          </p>
                          {isMemberCreator && (
                            <span title="Group Creator">
                              <Crown className="w-4 h-4 text-yellow-500" />
                            </span>
                          )}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.user.walletAddress.slice(0, 6)}...{member.user.walletAddress.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {member.isActive ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      
                      {isCreator && !isMemberCreator && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removeMemberMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-remove-member-${member.id}`}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}