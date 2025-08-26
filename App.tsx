import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Groups from "@/pages/groups";
import GroupDetails from "@/pages/group-details";
import BlockchainDashboard from "@/pages/blockchain-dashboard";
import BlockchainGroupDetails from "@/pages/blockchain-group-details";
import { Group } from "@/pages/Group";
import { Rewards } from "@/pages/rewards";
import ERC20Demo from "@/pages/erc20-demo";
import QADashboard from "@/pages/qa-dashboard";
import JoinGroup from "@/pages/join-group";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/:id" component={GroupDetails} />
      <Route path="/blockchain" component={BlockchainDashboard} />
      <Route path="/blockchain/group/:contractAddress" component={BlockchainGroupDetails} />
      <Route path="/group/1" component={Group} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/erc20" component={ERC20Demo} />
      <Route path="/qa" component={QADashboard} />
      <Route path="/invite/:groupId" component={JoinGroup} />
      <Route path="/join" component={JoinGroup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Add global error handler for unhandled promise rejections
  if (typeof window !== 'undefined') {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection:', event.reason);
      
      // Check if it's a wallet rejection error we can ignore
      if (event.reason?.code === 4001 || event.reason?.message?.includes('User rejected')) {
        console.warn('User rejected wallet request - preventing error overlay');
        event.preventDefault();
        return;
      }
      
      // Also handle wallet-related errors from MetaMask extension
      if (typeof event.reason === 'object' && event.reason?.stack?.includes('chrome-extension') && 
          (event.reason?.message?.includes('rejected') || event.reason?.code === 4001)) {
        console.warn('MetaMask user rejection - preventing error overlay');
        event.preventDefault();
        return;
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
