import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { BlockchainGroupCard } from "@/components/ui/blockchain-group-card";
import { 
  xitiqueContractService, 
  ContractGroupInfo, 
  CycleInfo,
  SelectionMode,
  GroupStatus 
} from "@/lib/contract";
import { 
  Wallet, 
  Plus, 
  Search, 
  ExternalLink,
  Zap,
  Users,
  TrendingUp
} from "lucide-react";

export default function BlockchainDashboard() {
  const [contractAddresses, setContractAddresses] = useState<string[]>([
    // Add some example contract addresses for testing
    // "0x1234567890abcdef1234567890abcdef12345678",
  ]);
  const [newContractAddress, setNewContractAddress] = useState("");
  const [connectedGroups, setConnectedGroups] = useState<{
    [address: string]: {
      info: ContractGroupInfo;
      cycleInfo?: CycleInfo | null;
      isUserMember: boolean;
      hasUserContributed: boolean;
      userReputation: number;
    }
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { isConnected, address, connect } = useWallet();
  const { toast } = useToast();

  // Get USDT balance
  const { data: usdtBalance } = useQuery({
    queryKey: ["/api/wallet/usdt-balance", address],
    enabled: !!address && isConnected,
    refetchInterval: 30000, // Refetch every 30 seconds
    queryFn: async () => {
      if (!address || !isConnected) return "0";
      try {
        const { web3Service } = await import("@/lib/web3");
        if (web3Service.isConnected()) {
          return await web3Service.getUSDTBalance(address);
        }
        return "0";
      } catch (error) {
        console.error("Failed to fetch USDT balance:", error);
        return "0";
      }
    },
  });

  // Redirect to connect wallet if not connected
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  const addContractAddress = () => {
    if (!newContractAddress) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid contract address",
        variant: "destructive",
      });
      return;
    }

    if (contractAddresses.includes(newContractAddress)) {
      toast({
        title: "Already Added",
        description: "This contract is already in your list",
        variant: "destructive",
      });
      return;
    }

    setContractAddresses([...contractAddresses, newContractAddress]);
    setNewContractAddress("");
    loadGroupInfo(newContractAddress);
  };

  const loadGroupInfo = async (contractAddress: string) => {
    if (!address) return;

    try {
      await xitiqueContractService.connectToContract(contractAddress);
      
      const [info, cycleInfo, isUserMember, userReputation] = await Promise.all([
        xitiqueContractService.getGroupInfo(),
        xitiqueContractService.getCurrentCycleInfo(),
        xitiqueContractService.isMember(address),
        xitiqueContractService.getReputationScore(address),
      ]);

      let hasUserContributed = false;
      if (cycleInfo && isUserMember) {
        hasUserContributed = await xitiqueContractService.hasContributed(address);
      }

      setConnectedGroups(prev => ({
        ...prev,
        [contractAddress]: {
          info,
          cycleInfo,
          isUserMember,
          hasUserContributed,
          userReputation,
        }
      }));

    } catch (error: any) {
      console.error("Failed to load group info:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to contract: " + error.message,
        variant: "destructive",
      });
      
      // Remove invalid contract address
      setContractAddresses(prev => prev.filter(addr => addr !== contractAddress));
    }
  };

  const refreshGroupInfo = async (contractAddress: string) => {
    await loadGroupInfo(contractAddress);
  };

  const handleJoinGroup = async (contractAddress: string) => {
    try {
      setIsLoading(true);
      await xitiqueContractService.connectToContract(contractAddress);
      const txHash = await xitiqueContractService.joinGroup();
      
      toast({
        title: "Joined Group",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      // Refresh group info after joining
      setTimeout(() => refreshGroupInfo(contractAddress), 3000);
    } catch (error: any) {
      toast({
        title: "Join Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = async (contractAddress: string) => {
    try {
      setIsLoading(true);
      await xitiqueContractService.connectToContract(contractAddress);
      
      const groupData = connectedGroups[contractAddress];
      if (!groupData) return;

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
      
      // Refresh group info after contribution
      setTimeout(() => refreshGroupInfo(contractAddress), 3000);
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

  const handleStartCycle = async (contractAddress: string, mode: SelectionMode) => {
    try {
      setIsLoading(true);
      await xitiqueContractService.connectToContract(contractAddress);
      
      const groupData = connectedGroups[contractAddress];
      if (!groupData) return;

      let txHash;
      if (!groupData.cycleInfo) {
        txHash = await xitiqueContractService.startFirstCycle(mode);
      } else {
        txHash = await xitiqueContractService.startNextCycle(mode);
      }
      
      toast({
        title: "Cycle Started",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      // Refresh group info after starting cycle
      setTimeout(() => refreshGroupInfo(contractAddress), 3000);
    } catch (error: any) {
      toast({
        title: "Start Cycle Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load group info for existing contract addresses
  useEffect(() => {
    if (address && isConnected) {
      contractAddresses.forEach(contractAddress => {
        loadGroupInfo(contractAddress);
      });
    }
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your Web3 wallet to access blockchain groups
                </p>
              </div>
              <Button onClick={connect}>
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Blockchain Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your Web3 savings groups on-chain
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">USDT Balance</div>
              <div className="text-lg font-semibold text-primary">
                {parseFloat(usdtBalance || "0").toFixed(2)} USDT
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Connected</div>
              <code className="text-xs bg-muted px-1 rounded">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </code>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Object.values(connectedGroups).filter(g => g.isUserMember).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Groups Joined</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Object.values(connectedGroups).reduce((sum, g) => sum + g.userReputation, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Reputation</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Object.values(connectedGroups).filter(g => 
                      g.cycleInfo && !g.cycleInfo.finalized && g.isUserMember && !g.hasUserContributed
                    ).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Contributions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Contract */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Connect to Group Contract
            </CardTitle>
            <CardDescription>
              Enter the contract address of a Xitique group to interact with it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="contract-address" className="sr-only">Contract Address</Label>
                <Input
                  id="contract-address"
                  placeholder="0x1234567890abcdef1234567890abcdef12345678"
                  value={newContractAddress}
                  onChange={(e) => setNewContractAddress(e.target.value)}
                />
              </div>
              <Button onClick={addContractAddress} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid */}
        {contractAddresses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Groups Connected
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connect to your first Xitique group contract to get started
              </p>
              <p className="text-sm text-muted-foreground">
                Contract addresses are provided when groups are deployed on-chain
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {contractAddresses.map((contractAddress) => {
              const groupData = connectedGroups[contractAddress];
              
              if (!groupData) {
                return (
                  <Card key={contractAddress} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div key={contractAddress} className="relative">
                  <BlockchainGroupCard
                    groupInfo={groupData.info}
                    cycleInfo={groupData.cycleInfo}
                    userAddress={address || ""}
                    isUserMember={groupData.isUserMember}
                    hasUserContributed={groupData.hasUserContributed}
                    onJoin={() => handleJoinGroup(contractAddress)}
                    onContribute={() => handleContribute(contractAddress)}
                    onStartCycle={(mode) => handleStartCycle(contractAddress, mode)}
                    onViewDetails={() => {
                      // Navigate to detailed view
                      window.open(`/blockchain/group/${contractAddress}`, '_blank');
                    }}
                  />
                  
                  {/* Contract Address Footer */}
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <div className="flex items-center justify-between">
                      <code className="text-muted-foreground">
                        {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(contractAddress);
                          toast({
                            title: "Copied",
                            description: "Contract address copied to clipboard",
                          });
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}