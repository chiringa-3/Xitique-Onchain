import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/use-wallet";
import { Wallet, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WalletConnection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, address, connect, disconnect, isLoading } = useWallet();

  const handleConnect = async () => {
    if (isConnected) {
      try {
        await disconnect();
      } catch (error) {
        console.warn("Disconnect failed:", error);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleWalletConnect = async (walletType: string) => {
    try {
      await connect();
      setIsModalOpen(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        {isConnected && address && (
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatAddress(address)}
            </span>
          </div>
        )}
        
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-primary text-white hover:bg-primary/90"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isConnected ? "Connected" : "Connect Wallet"}
          </span>
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold mb-2">Connect Your Wallet</DialogTitle>
              <p className="text-gray-600 dark:text-gray-400">Choose your preferred wallet to connect to Xitique</p>
            </div>
          </DialogHeader>
          
          <div className="space-y-3">
            <button
              onClick={() => handleWalletConnect("metamask")}
              className="w-full flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">MetaMask</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connect using browser wallet</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button
              onClick={() => handleWalletConnect("walletconnect")}
              className="w-full flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">WalletConnect</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connect using mobile wallet</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button
              onClick={() => handleWalletConnect("coinbase")}
              className="w-full flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Coinbase Wallet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connect using Coinbase</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
            >
              Cancel
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
              Don't have a wallet?{" "}
              <a href="#" className="underline" onClick={(e) => e.preventDefault()}>
                Learn how to create one
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
