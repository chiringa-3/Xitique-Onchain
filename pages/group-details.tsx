import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberManagement } from "@/components/ui/member-management";
import { ContributeForm } from "@/components/ContributeForm";
import { useWallet } from "@/hooks/use-wallet";
import { ArrowLeft, Users, Calendar, DollarSign, Clock, Target } from "lucide-react";
import type { Group } from "@shared/schema";

interface Member {
  id: string;
  displayName: string;
  wallet: string;
  status: "contributed" | "pending" | "penalized" | "removed";
  avatarUrl?: string;
}

interface Transaction {
  id: string;
  dateISO: string;
  memberId: string;
  amount: number;
  currency: "USDT";
  type: "contribution" | "payout" | "penalty";
  roundIndex: number;
  txHash?: string;
}

interface GroupDetails {
  id: string;
  name: string;
  description?: string;
  iconKey?: "capulana" | "mask" | "shield" | "tribal_knot";
  createdBy: { name: string; wallet: string };
  currency: "USDT";
  contributionValue: number;
  frequency: "weekly" | "biweekly" | "monthly";
  nextDueDateISO: string;
  dueGraceHours: number;
  maxParticipants: number;
  members: Member[];
  priorityRule: "fixed_order" | "auction" | "lottery";
  penalties: Array<{
    reason: "late" | "missing" | "rule_violation";
    amount: number;
    currency: "USDT";
    autoApply: boolean;
    notes?: string;
  }>;
  rounds: Array<{ roundIndex: number; recipientMemberId: string; payoutDateISO?: string }>;
  transactions: Transaction[];
}

function GroupDetails() {
  const [, params] = useRoute("/groups/:id");
  const groupId = params?.id;
  const { address } = useWallet();

  const { data: group, isLoading, error } = useQuery<Group>({
    queryKey: ["/api/groups", groupId],
    enabled: !!groupId,
  });

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
          <CardHeader>
            <CardTitle className="text-red-600">Group Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The group you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link to="/groups">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Groups
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform the basic group data to include additional details for the view
  const detailedGroup: GroupDetails = {
    id: group.id,
    name: group.name,
    description: group.description || undefined,
    iconKey: "tribal_knot",
    createdBy: { name: `User ${group.creatorId.slice(-8)}`, wallet: group.creatorId },
    currency: "USDT",
    contributionValue: group.contributionAmt,
    frequency: group.frequency as "weekly" | "biweekly" | "monthly",
    nextDueDateISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueGraceHours: 24,
    maxParticipants: group.maxParticipants,
    members: [
      {
        id: "1",
        displayName: `Creator ${group.creatorId.slice(-8)}`,
        wallet: group.creatorId,
        status: "contributed" as const,
      },
    ],
    priorityRule: group.priorityType as "fixed_order" | "auction" | "lottery",
    penalties: [
      {
        reason: "late" as const,
        amount: group.contributionAmt * 0.1,
        currency: "USDT",
        autoApply: true,
        notes: "10% of contribution amount for late payment",
      },
    ],
    rounds: [
      {
        roundIndex: 1,
        recipientMemberId: "1",
        payoutDateISO: typeof group.startDate === 'string' ? group.startDate : new Date(group.startDate).toISOString(),
      },
    ],
    transactions: [],
  };

  const statusColors = {
    contributed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    penalized: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    removed: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  };

  const frequencyLabels = {
    weekly: "Weekly",
    biweekly: "Bi-weekly", 
    monthly: "Monthly",
  };

  const priorityLabels = {
    fixed_order: "Fixed Order",
    auction: "Auction",
    lottery: "Lottery",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/groups">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{detailedGroup.name}</h1>
            {detailedGroup.description && (
              <p className="text-gray-600 dark:text-gray-400">{detailedGroup.description}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {/* Group Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Group Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contribution</p>
                  <p className="text-lg font-semibold">{detailedGroup.contributionValue} {detailedGroup.currency}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Frequency</p>
                  <p className="text-lg font-semibold">{frequencyLabels[detailedGroup.frequency]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                  <p className="text-lg font-semibold">{detailedGroup.members.length}/{detailedGroup.maxParticipants}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority Rule</p>
                  <p className="text-lg font-semibold">{priorityLabels[detailedGroup.priorityRule]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="contribute">Contribute</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Members Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members ({detailedGroup.members.length})
                  </CardTitle>
                  <CardDescription>
                    Current group participants and their contribution status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {detailedGroup.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {member.displayName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{member.displayName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {member.wallet.slice(0, 6)}...{member.wallet.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusColors[member.status]}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest contributions and payouts</CardDescription>
                </CardHeader>
                <CardContent>
                  {detailedGroup.transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Transactions will appear here once contributions start
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailedGroup.transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(transaction.dateISO).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {transaction.amount} {transaction.currency}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <MemberManagement group={group} currentUserId={address || undefined} />
            </TabsContent>

            <TabsContent value="contribute" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Make a Contribution</CardTitle>
                  <CardDescription>
                    Submit your {group.frequency} contribution of {group.contributionAmt} USDT
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {group.contractAddress ? (
                    <ContributeForm contractAddress={group.contractAddress} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        This group doesn't have a smart contract yet.
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Contact the group creator to deploy a contract for blockchain contributions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* All Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>All Activity</CardTitle>
                  <CardDescription>Complete transaction history for this group</CardDescription>
                </CardHeader>
                <CardContent>
                  {detailedGroup.transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Transactions will appear here once contributions start
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailedGroup.transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(transaction.dateISO).toLocaleDateString()} - Round {transaction.roundIndex}
                            </p>
                            {transaction.txHash && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                {transaction.txHash.slice(0, 10)}...{transaction.txHash.slice(-8)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {transaction.amount} {transaction.currency}
                            </p>
                            <Badge variant={transaction.type === "contribution" ? "secondary" : 
                                           transaction.type === "payout" ? "default" : "destructive"}>
                              {transaction.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default GroupDetails;