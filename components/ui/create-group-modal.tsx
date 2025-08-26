import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGroupSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, X, Loader2, CheckCircle, Sparkles, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { xitiqueContractService } from "@/lib/contract";
import { useWallet } from "@/hooks/use-wallet";

const createGroupFormSchema = insertGroupSchema.omit({ startDate: true, creatorId: true }).extend({
  startDate: z.string().min(1, "Start date is required"),
  creatorId: z.string(),
});

type CreateGroupForm = z.infer<typeof createGroupFormSchema>;

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export function CreateGroupModal({ isOpen, onClose, currentUserId }: CreateGroupModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useWallet();
  const [deploymentStage, setDeploymentStage] = useState<'idle' | 'deploying' | 'creating' | 'success' | 'error'>('idle');
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      symbol: "",
      contributionAmt: 100.0,
      frequency: "weekly",
      maxParticipants: 10,
      startDate: "",
      isPublic: true,
      creatorId: currentUserId,
      status: "active",
      priorityType: "lottery",
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupForm) => {
      // Deploy contract first if wallet is connected
      let deployedAddress = null;
      
      if (isConnected) {
        try {
          setDeploymentStage('deploying');
          
          // Deploy smart contract with progress feedback
          deployedAddress = await xitiqueContractService.deployGroupContract({
            name: data.name,
            symbol: data.symbol || data.name.substring(0, 3).toUpperCase(),
            contributionAmount: data.contributionAmt,
            frequencyDays: data.frequency === "weekly" ? 7 : data.frequency === "monthly" ? 30 : 14,
            maxParticipants: data.maxParticipants,
          });
          
          setContractAddress(deployedAddress);
          
          toast({
            title: "✨ Contract Deployed!",
            description: `Smart contract deployed at: ${deployedAddress.substring(0, 6)}...${deployedAddress.slice(-4)}`,
            duration: 4000,
          });
        } catch (error) {
          console.warn("Contract deployment failed, creating group without contract:", error);
          toast({
            title: "⚠️ Contract Warning", 
            description: "Group created without smart contract. You can deploy later.",
            variant: "destructive",
          });
        }
      }

      setDeploymentStage('creating');
      
      // Create group in database
      const response = await apiRequest("POST", "/api/groups", {
        ...data,
        contractAddress: deployedAddress,
        startDate: data.startDate, // Send as string, backend will handle conversion
      });
      return response.json();
    },
    onSuccess: (data) => {
      setDeploymentStage('success');
      
      const contractMsg = data.contractAddress 
        ? `Smart contract: ${data.contractAddress.substring(0, 6)}...${data.contractAddress.slice(-4)}`
        : "";
      
      toast({
        title: "🎉 Group Created Successfully!",
        description: `Your Xitique group has been created! ${contractMsg}`,
        duration: 5000,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/public"] });
      
      // Reset and close after animation
      setTimeout(() => {
        form.reset();
        setDeploymentStage('idle');
        setContractAddress(null);
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      setDeploymentStage('error');
      
      toast({
        variant: "destructive",
        title: "❌ Creation Failed",
        description: `Failed to create group: ${error.message}`,
        duration: 7000,
      });
      
      setTimeout(() => setDeploymentStage('idle'), 3000);
    },
  });

  const onSubmit = (data: CreateGroupForm) => {
    createGroupMutation.mutate(data);
  };

  const estimatedGasFee = 0.01; // Mock gas fee
  const creationFee = 0.001;
  const totalCost = estimatedGasFee + creationFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-2xl font-bold">Create New Xitique Group</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Group Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Enter group name"
                {...form.register("name")}
                className="mt-2"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="symbol">Group Symbol</Label>
              <Input
                id="symbol"
                maxLength={3}
                placeholder="e.g., FG"
                {...form.register("symbol")}
                className="mt-2"
              />
              {form.formState.errors.symbol && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.symbol.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe your savings group purpose"
                {...form.register("description")}
                className="mt-2"
              />
            </div>
          </div>
          
          {/* Financial Parameters */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Financial Parameters</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contributionAmt">Contribution Amount (USDT)</Label>
                <Input
                  id="contributionAmt"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  {...form.register("contributionAmt", { valueAsNumber: true })}
                  className="mt-2"
                />
                {form.formState.errors.contributionAmt && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.contributionAmt.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={form.watch("frequency")}
                  onValueChange={(value) => form.setValue("frequency", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="2"
                  max="50"
                  placeholder="10"
                  {...form.register("maxParticipants", { valueAsNumber: true })}
                  className="mt-2"
                />
                {form.formState.errors.maxParticipants && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.maxParticipants.message}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Group Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Group Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate")}
                  className="mt-2"
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.startDate.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="priorityType">Payout Priority</Label>
                <Select
                  value={form.watch("priorityType") || "lottery"}
                  onValueChange={(value) => form.setValue("priorityType", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select priority type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lottery">Lottery (Random)</SelectItem>
                    <SelectItem value="vote">Group Vote</SelectItem>
                    <SelectItem value="bid">Highest Bid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="isPublic"
                checked={form.watch("isPublic") === true}
                onCheckedChange={(checked) => form.setValue("isPublic", checked === true)}
              />
              <Label htmlFor="isPublic">Make group discoverable publicly</Label>
            </div>
          </div>
          
          {/* Cost Breakdown */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Hedera Network Fees</h5>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex justify-between">
                <span>Group Creation</span>
                <span>~0.05 HBAR</span>
              </div>
              <div className="flex justify-between">
                <span>Smart Contract Deployment</span>
                <span>~2.0 HBAR</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-blue-300 dark:border-blue-700">
                <span>Total Network Fees</span>
                <span>~2.05 HBAR</span>
              </div>
              <p className="text-xs mt-2 text-blue-700 dark:text-blue-300">
                All contributions will be in USDT. Network fees are paid in HBAR.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`flex-1 transition-all duration-300 relative overflow-hidden ${
                deploymentStage === 'success' ? 'bg-green-500 hover:bg-green-600 scale-105' :
                deploymentStage === 'error' ? 'bg-red-500 hover:bg-red-600' :
                deploymentStage !== 'idle' ? 'animate-pulse bg-primary/80' : 
                'bg-primary hover:bg-primary/90'
              }`}
              disabled={createGroupMutation.isPending || deploymentStage !== 'idle'}
            >
              {/* Animated background for success */}
              {deploymentStage === 'success' && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 animate-pulse opacity-50"></div>
              )}
              
              <div className="flex items-center justify-center space-x-2 relative z-10">
                {deploymentStage === 'deploying' && (
                  <Sparkles className="w-4 h-4 animate-pulse" />
                )}
                {deploymentStage === 'creating' && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {deploymentStage === 'success' && (
                  <CheckCircle className="w-4 h-4" />
                )}
                {deploymentStage === 'error' && (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {deploymentStage === 'idle' && (
                  <Plus className="w-4 h-4" />
                )}
                
                <span className="font-medium">
                  {deploymentStage === 'deploying' ? "Deploying Contract..." :
                   deploymentStage === 'creating' ? "Creating Group..." :
                   deploymentStage === 'success' ? "Group Created!" :
                   deploymentStage === 'error' ? "Failed - Try Again" :
                   "Create Group"}
                </span>
              </div>
            </Button>
            
            {/* Contract deployment status */}
            {contractAddress && deploymentStage === 'success' && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Smart Contract Deployed!
                  </span>
                </div>
                <p className="text-xs font-mono text-green-600 dark:text-green-400 break-all">
                  {contractAddress}
                </p>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
