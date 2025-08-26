import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { xitiqueContractService, ContractGroupInfo, CycleInfo } from "@/lib/contract";
import { useWallet } from "@/hooks/use-wallet";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface ContributeFormProps {
  contractAddress?: string;
}

export function ContributeForm({ contractAddress }: ContributeFormProps) {
  const { isConnected, address, connect } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState("");
  const [transactionStage, setTransactionStage] = useState<'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  // Fetch group information
  const { data: groupInfo, isLoading: groupLoading, error: groupError } = useQuery({
    queryKey: ['groupInfo', contractAddress],
    queryFn: () => xitiqueContractService.getGroupInfo(contractAddress),
    enabled: !!contractAddress || !!import.meta.env.VITE_XITIQUE_ADDRESS,
  });

  // Fetch current cycle information
  const { data: cycleInfo, isLoading: cycleLoading } = useQuery({
    queryKey: ['cycleInfo', contractAddress],
    queryFn: () => xitiqueContractService.getCurrentCycleInfo(contractAddress),
    enabled: !!contractAddress || !!import.meta.env.VITE_XITIQUE_ADDRESS,
  });

  // Check if user is a member
  const { data: isMember } = useQuery({
    queryKey: ['isMember', address, contractAddress],
    queryFn: () => address ? xitiqueContractService.isMember(address, contractAddress) : false,
    enabled: !!address && (!!contractAddress || !!import.meta.env.VITE_XITIQUE_ADDRESS),
  });

  // Get member list
  const { data: memberList } = useQuery({
    queryKey: ['memberList', contractAddress],
    queryFn: () => xitiqueContractService.getMemberList(contractAddress),
    enabled: !!contractAddress || !!import.meta.env.VITE_XITIQUE_ADDRESS,
  });

  // Join group mutation with enhanced transaction feedback
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      setTransactionStage('preparing');
      const result = await xitiqueContractService.joinGroup(contractAddress);
      setTransactionStage('pending');
      return result;
    },
    onSuccess: (data) => {
      setTransactionStage('confirming');
      setTxHash(typeof data === 'object' && data && 'hash' in data ? data.hash as string : null);
      
      // Show immediate success feedback
      toast({
        title: "🎉 Welcome to the group!",
        description: "Transaction confirmed. You can now participate in cycles.",
        duration: 5000,
      });
      
      setTimeout(() => {
        setTransactionStage('success');
        queryClient.invalidateQueries({ queryKey: ['groupInfo'] });
        queryClient.invalidateQueries({ queryKey: ['isMember'] });
        queryClient.invalidateQueries({ queryKey: ['memberList'] });
        
        // Reset state after animation
        setTimeout(() => setTransactionStage('idle'), 2000);
      }, 1500);
    },
    onError: (error) => {
      setTransactionStage('error');
      toast({
        variant: "destructive",
        title: "❌ Transaction Failed",
        description: `Failed to join group: ${error.message}`,
        duration: 7000,
      });
      setTimeout(() => setTransactionStage('idle'), 3000);
    },
  });

  // Contribute mutation with enhanced transaction feedback
  const contributeMutation = useMutation({
    mutationFn: async () => {
      setTransactionStage('preparing');
      const result = await xitiqueContractService.contribute(contractAddress);
      setTransactionStage('pending');
      return result;
    },
    onSuccess: (data) => {
      setTransactionStage('confirming');
      setTxHash(typeof data === 'object' && data && 'hash' in data ? data.hash as string : null);
      
      toast({
        title: "💰 Contribution Successful!",
        description: "Your contribution has been recorded on the blockchain.",
        duration: 5000,
      });
      
      setTimeout(() => {
        setTransactionStage('success');
        queryClient.invalidateQueries({ queryKey: ['cycleInfo'] });
        
        // Reset state after animation
        setTimeout(() => setTransactionStage('idle'), 2000);
      }, 1500);
    },
    onError: (error) => {
      setTransactionStage('error');
      toast({
        variant: "destructive",
        title: "❌ Contribution Failed",
        description: `Failed to contribute: ${error.message}`,
        duration: 7000,
      });
      setTimeout(() => setTransactionStage('idle'), 3000);
    },
  });

  // Place bid mutation with enhanced transaction feedback
  const bidMutation = useMutation({
    mutationFn: async (amount: number) => {
      setTransactionStage('preparing');
      const result = await xitiqueContractService.placeBid(amount, contractAddress);
      setTransactionStage('pending');
      return result;
    },
    onSuccess: (data) => {
      setTransactionStage('confirming');
      setTxHash(typeof data === 'object' && data && 'hash' in data ? data.hash as string : null);
      
      toast({
        title: "🎯 Bid Placed!",
        description: "Your bid has been submitted to the auction.",
        duration: 5000,
      });
      
      setTimeout(() => {
        setTransactionStage('success');
        setBidAmount("");
        queryClient.invalidateQueries({ queryKey: ['cycleInfo'] });
        
        // Reset state after animation
        setTimeout(() => setTransactionStage('idle'), 2000);
      }, 1500);
    },
    onError: (error) => {
      setTransactionStage('error');
      toast({
        variant: "destructive",
        title: "❌ Bid Failed",
        description: `Failed to place bid: ${error.message}`,
        duration: 7000,
      });
      setTimeout(() => setTransactionStage('idle'), 3000);
    },
  });

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to interact with the Xitique group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connect} data-testid="button-connect-wallet">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (groupLoading || cycleLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading group information...</div>
        </CardContent>
      </Card>
    );
  }

  if (groupError || !groupInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load group information. Please check your contract configuration.
          </div>
        </CardContent>
      </Card>
    );
  }

  const contributionProgress = cycleInfo 
    ? (cycleInfo.contributors / groupInfo.activeMembersCount) * 100 
    : 0;

  const dueTime = cycleInfo ? new Date(cycleInfo.dueTime * 1000) : null;
  const isOverdue = dueTime && dueTime < new Date();

  return (
    <div className="space-y-6">
      {/* Group Information */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-group-name">{groupInfo.name}</CardTitle>
          <CardDescription data-testid="text-group-symbol">
            {groupInfo.symbol} • {groupInfo.totalMembers} / {groupInfo.maxParticipants} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Contribution Amount</Label>
              <p className="font-semibold" data-testid="text-contribution-amount">
                {groupInfo.contributionAmount} USDT
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Frequency</Label>
              <p className="font-semibold" data-testid="text-frequency">
                {groupInfo.frequencyDays} days
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Creator</Label>
              <p className="font-mono text-sm" data-testid="text-creator">
                {groupInfo.creator.slice(0, 6)}...{groupInfo.creator.slice(-4)}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Badge variant={groupInfo.status === 0 ? "default" : "secondary"} data-testid="badge-status">
                {groupInfo.status === 0 ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Actions */}
      {!isMember ? (
        <Card>
          <CardHeader>
            <CardTitle>Join Group</CardTitle>
            <CardDescription>
              Become a member of this savings group to participate in cycles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => joinGroupMutation.mutate()} 
              disabled={joinGroupMutation.isPending || transactionStage !== 'idle'}
              className={`w-full transition-all duration-300 ${
                transactionStage === 'success' ? 'bg-green-500 hover:bg-green-600 scale-105' :
                transactionStage === 'error' ? 'bg-red-500 hover:bg-red-600' :
                transactionStage !== 'idle' ? 'animate-pulse' : ''
              }`}
              data-testid="button-join-group"
            >
              <div className="flex items-center justify-center gap-2">
                {transactionStage === 'preparing' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {transactionStage === 'pending' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                )}
                {transactionStage === 'confirming' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {transactionStage === 'success' && (
                  <CheckCircle className="h-4 w-4" />
                )}
                {transactionStage === 'error' && (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>
                  {transactionStage === 'preparing' ? 'Preparing Transaction...' :
                   transactionStage === 'pending' ? 'Confirm in Wallet...' :
                   transactionStage === 'confirming' ? 'Confirming on Blockchain...' :
                   transactionStage === 'success' ? 'Joined Successfully!' :
                   transactionStage === 'error' ? 'Failed - Try Again' :
                   'Join Group'}
                </span>
              </div>
            </Button>
            {txHash && transactionStage === 'confirming' && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono break-all">
                  Transaction Hash: {txHash}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Cycle Information */}
          {cycleInfo ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Cycle #{cycleInfo.id}</CardTitle>
                <CardDescription>
                  {dueTime && (
                    <span className={isOverdue ? "text-red-600" : ""}>
                      {isOverdue ? "Overdue" : "Due"} {formatDistanceToNow(dueTime, { addSuffix: true })}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Contribution Progress</Label>
                    <span className="text-sm text-muted-foreground">
                      {cycleInfo.contributors} / {groupInfo.activeMembersCount}
                    </span>
                  </div>
                  <Progress value={contributionProgress} data-testid="progress-contributions" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Total Contributed</Label>
                    <p className="font-semibold" data-testid="text-total-contributed">
                      {cycleInfo.totalContributed} USDT
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Selection Mode</Label>
                    <Badge variant="outline" data-testid="badge-selection-mode">
                      {cycleInfo.selectionMode === 0 ? "Lottery" : 
                       cycleInfo.selectionMode === 1 ? "Auction" : "Vote"}
                    </Badge>
                  </div>
                </div>

                {/* Contribution Button */}
                <Button 
                  onClick={() => contributeMutation.mutate()}
                  disabled={contributeMutation.isPending || cycleInfo.finalized || transactionStage !== 'idle'}
                  className={`w-full transition-all duration-300 relative overflow-hidden ${
                    transactionStage === 'success' ? 'bg-green-500 hover:bg-green-600 scale-105' :
                    transactionStage === 'error' ? 'bg-red-500 hover:bg-red-600' :
                    transactionStage !== 'idle' ? 'animate-pulse' : ''
                  }`}
                  data-testid="button-contribute"
                >
                  {/* Animated background effect for success */}
                  {transactionStage === 'success' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 animate-pulse opacity-50"></div>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    {transactionStage === 'preparing' && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {transactionStage === 'pending' && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                    )}
                    {transactionStage === 'confirming' && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        <div className="w-1 h-1 bg-current rounded-full animate-ping"></div>
                      </div>
                    )}
                    {transactionStage === 'success' && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {transactionStage === 'error' && (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {transactionStage === 'preparing' ? 'Preparing Contribution...' :
                       transactionStage === 'pending' ? 'Confirm in Wallet...' :
                       transactionStage === 'confirming' ? 'Processing on Blockchain...' :
                       transactionStage === 'success' ? 'Contribution Successful!' :
                       transactionStage === 'error' ? 'Failed - Try Again' :
                       'Contribute to Cycle'}
                    </span>
                  </div>
                </Button>
                
                {/* Transaction status indicator */}
                {txHash && (transactionStage === 'confirming' || transactionStage === 'success') && (
                  <div className={`mt-3 p-3 rounded-md transition-all duration-500 ${
                    transactionStage === 'success' ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' :
                    'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {transactionStage === 'confirming' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                      )}
                      {transactionStage === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        transactionStage === 'success' ? 'text-green-700 dark:text-green-300' :
                        'text-blue-700 dark:text-blue-300'
                      }`}>
                        {transactionStage === 'confirming' ? 'Transaction Confirming...' : 'Transaction Confirmed!'}
                      </span>
                    </div>
                    <p className={`text-xs font-mono break-all ${
                      transactionStage === 'success' ? 'text-green-600 dark:text-green-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {txHash}
                    </p>
                  </div>
                )}

                {/* Auction Bidding */}
                {cycleInfo.selectionMode === 1 && !cycleInfo.finalized && (
                  <div className="space-y-2">
                    <Label>Place Bid (USDT)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter bid amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        data-testid="input-bid-amount"
                      />
                      <Button 
                        onClick={() => bidMutation.mutate(parseFloat(bidAmount))}
                        disabled={bidMutation.isPending || !bidAmount || parseFloat(bidAmount) <= 0 || transactionStage !== 'idle'}
                        className={`transition-all duration-300 ${
                          transactionStage === 'success' ? 'bg-green-500 hover:bg-green-600 scale-105' :
                          transactionStage === 'error' ? 'bg-red-500 hover:bg-red-600' :
                          transactionStage !== 'idle' ? 'animate-pulse' : ''
                        }`}
                        data-testid="button-place-bid"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {transactionStage === 'preparing' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          {transactionStage === 'pending' && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                            </div>
                          )}
                          {transactionStage === 'confirming' && (
                            <Sparkles className="h-4 w-4 animate-pulse" />
                          )}
                          {transactionStage === 'success' && (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          {transactionStage === 'error' && (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span>
                            {transactionStage === 'preparing' ? 'Preparing Bid...' :
                             transactionStage === 'pending' ? 'Confirm in Wallet...' :
                             transactionStage === 'confirming' ? 'Submitting Bid...' :
                             transactionStage === 'success' ? 'Bid Placed!' :
                             transactionStage === 'error' ? 'Failed - Try Again' :
                             'Place Bid'}
                          </span>
                        </div>
                      </Button>
                    </div>
                    {cycleInfo.highestBid !== "0" && (
                      <p className="text-sm text-muted-foreground" data-testid="text-highest-bid">
                        Highest bid: {cycleInfo.highestBid} USDT by {cycleInfo.highestBidder.slice(0, 6)}...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No active cycle. Waiting for the first cycle to start.</p>
              </CardContent>
            </Card>
          )}

          {/* Member List */}
          {memberList && (
            <Card>
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {memberList.map((member, index) => (
                    <div key={member} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-mono text-sm" data-testid={`text-member-${index}`}>
                        {member.slice(0, 6)}...{member.slice(-4)}
                      </span>
                      {member.toLowerCase() === address?.toLowerCase() && (
                        <Badge variant="secondary">You</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}