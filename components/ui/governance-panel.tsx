import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Vote, 
  Users, 
  Pause, 
  Play, 
  StopCircle, 
  Settings, 
  UserMinus,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { ProposalType, xitiqueContractService } from "@/lib/contract";

interface GovernancePanelProps {
  members: string[];
  userAddress: string;
  isUserMember: boolean;
  activeMembersCount: number;
}

interface ProposalData {
  id: number;
  type: ProposalType;
  title: string;
  description: string;
  paramAddress?: string;
  paramUint?: number;
  yesVotes: number;
  noVotes: number;
  executed: boolean;
  hasVoted: boolean;
}

const proposalTypeLabels = {
  [ProposalType.ChangeRule]: "Change Rules",
  [ProposalType.RemoveMember]: "Remove Member",
  [ProposalType.PauseGroup]: "Pause Group",
  [ProposalType.ResumeGroup]: "Resume Group", 
  [ProposalType.EndGroup]: "End Group",
};

const proposalTypeIcons = {
  [ProposalType.ChangeRule]: Settings,
  [ProposalType.RemoveMember]: UserMinus,
  [ProposalType.PauseGroup]: Pause,
  [ProposalType.ResumeGroup]: Play,
  [ProposalType.EndGroup]: StopCircle,
};

export function GovernancePanel({ 
  members, 
  userAddress, 
  isUserMember, 
  activeMembersCount 
}: GovernancePanelProps) {
  const [selectedProposalType, setSelectedProposalType] = useState<ProposalType>(ProposalType.ChangeRule);
  const [targetAddress, setTargetAddress] = useState("");
  const [paramValue, setParamValue] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [proposals] = useState<ProposalData[]>([]); // In real app, fetch from contract events/subgraph
  
  const { toast } = useToast();

  const handleCreateProposal = async () => {
    if (!isUserMember) {
      toast({
        title: "Access Denied",
        description: "Only group members can create proposals",
        variant: "destructive",
      });
      return;
    }

    if (selectedProposalType === ProposalType.RemoveMember && !targetAddress) {
      toast({
        title: "Target Required",
        description: "Please specify the member address to remove",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const txHash = await xitiqueContractService.createProposal(
        selectedProposalType,
        targetAddress || undefined,
        paramValue ? parseInt(paramValue) : 0
      );

      toast({
        title: "Proposal Created",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });

      // Reset form
      setTargetAddress("");
      setParamValue("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Proposal Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoteProposal = async (proposalId: number, support: boolean) => {
    try {
      setIsLoading(true);
      
      const txHash = await xitiqueContractService.voteProposal(proposalId, support);
      
      toast({
        title: "Vote Cast",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
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

  const handleExecuteProposal = async (proposalId: number) => {
    try {
      setIsLoading(true);
      
      const txHash = await xitiqueContractService.executeProposal(proposalId);
      
      toast({
        title: "Proposal Executed",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVoteThreshold = () => Math.floor(activeMembersCount / 2) + 1;

  return (
    <div className="space-y-6">
      {/* Create Proposal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Create Proposal
          </CardTitle>
          <CardDescription>
            Submit a proposal for group governance. Requires majority vote ({getVoteThreshold()}/{activeMembersCount}) to pass.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposal-type">Proposal Type</Label>
            <select
              id="proposal-type"
              value={selectedProposalType}
              onChange={(e) => setSelectedProposalType(Number(e.target.value) as ProposalType)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {Object.entries(proposalTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {selectedProposalType === ProposalType.RemoveMember && (
            <div className="space-y-2">
              <Label htmlFor="target-address">Member to Remove</Label>
              <select
                id="target-address"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select member</option>
                {members
                  .filter(member => member.toLowerCase() !== userAddress.toLowerCase())
                  .map((member) => (
                    <option key={member} value={member}>
                      {member.slice(0, 6)}...{member.slice(-4)}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {selectedProposalType === ProposalType.ChangeRule && (
            <div className="space-y-2">
              <Label htmlFor="param-value">Parameter Value</Label>
              <Input
                id="param-value"
                type="number"
                placeholder="New rule parameter value"
                value={paramValue}
                onChange={(e) => setParamValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Note: Rule changes require specific parameter encoding
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Explain the reasoning for this proposal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleCreateProposal}
            disabled={isLoading || !isUserMember}
            className="w-full"
          >
            <Vote className="w-4 h-4 mr-2" />
            {isLoading ? "Creating..." : "Create Proposal"}
          </Button>
        </CardContent>
      </Card>

      {/* Active Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>Active Proposals</CardTitle>
          <CardDescription>
            Vote on current proposals. Each member gets one vote.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-8">
              <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No active proposals</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create the first proposal to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const Icon = proposalTypeIcons[proposal.type];
                const totalVotes = proposal.yesVotes + proposal.noVotes;
                const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
                const requiredVotes = getVoteThreshold();
                const canExecute = proposal.yesVotes >= requiredVotes && !proposal.executed;
                
                return (
                  <Card key={proposal.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold">{proposal.title}</h4>
                            <Badge variant="outline">
                              {proposalTypeLabels[proposal.type]}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {proposal.executed ? (
                            <Badge className="bg-green-100 text-green-800">
                              Executed
                            </Badge>
                          ) : canExecute ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              Ready to Execute
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Voting
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {proposal.description}
                      </p>

                      {/* Vote Results */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Yes: {proposal.yesVotes}</span>
                          <span>No: {proposal.noVotes}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${yesPercentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Needs {Math.max(0, requiredVotes - proposal.yesVotes)} more yes votes to pass
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!proposal.executed && !proposal.hasVoted && isUserMember && (
                          <>
                            <Button
                              onClick={() => handleVoteProposal(proposal.id, true)}
                              disabled={isLoading}
                              size="sm"
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Vote Yes
                            </Button>
                            <Button
                              onClick={() => handleVoteProposal(proposal.id, false)}
                              disabled={isLoading}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Vote No
                            </Button>
                          </>
                        )}
                        
                        {canExecute && (
                          <Button
                            onClick={() => handleExecuteProposal(proposal.id)}
                            disabled={isLoading}
                            size="sm"
                            className="flex-1"
                          >
                            Execute Proposal
                          </Button>
                        )}

                        {proposal.hasVoted && (
                          <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
                            You have already voted
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}