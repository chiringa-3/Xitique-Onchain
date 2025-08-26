import { useState, useEffect, useCallback } from "react";
import { web3Service } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isLoading: false,
    error: null,
  });

  const { toast } = useToast();

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await web3Service.connectWallet();
      
      if (result) {
        const network = await web3Service.getNetwork();
        const balance = await web3Service.getBalance(result.address);
        
        setState({
          isConnected: true,
          address: result.address,
          balance,
          chainId: network.chainId,
          isLoading: false,
          error: null,
        });

        toast({
          title: "Wallet Connected",
          description: `Connected to ${result.address.slice(0, 6)}...${result.address.slice(-4)}`,
        });

        // Store connection state in localStorage
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_address', result.address);
      }
    } catch (error: any) {
      let errorMessage = error.message || "Failed to connect wallet";
      let showToast = true;
      
      // Handle specific wallet errors gracefully
      if (error.code === 4001 || errorMessage.includes('User rejected')) {
        errorMessage = "Connection cancelled by user";
        showToast = false; // Don't show error toast for user cancellation
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending. Please check your wallet.";
      }
      
      console.warn("Wallet connection error:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: showToast ? errorMessage : null 
      }));
      
      if (showToast) {
        toast({
          title: "Connection Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    try {
      await web3Service.disconnect();
      setState({
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        isLoading: false,
        error: null,
      });

      // Clear localStorage
      localStorage.removeItem('wallet_connected');
      localStorage.removeItem('wallet_address');

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendUSDTTransaction = useCallback(async (to: string, amount: string) => {
    if (!state.isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const txHash = await web3Service.sendUSDTTransaction(to, amount);
      
      toast({
        title: "USDT Transaction Sent",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });

      return txHash;
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send USDT transaction",
        variant: "destructive",
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isConnected, toast]);

  const sendTransaction = useCallback(async (to: string, amount: string) => {
    if (!state.isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const txHash = await web3Service.sendTransaction(to, amount);
      
      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });

      return txHash;
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isConnected, toast]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem('wallet_connected') === 'true';
      const savedAddress = localStorage.getItem('wallet_address');
      
      if (wasConnected && savedAddress) {
        try {
          const provider = await web3Service.detectProvider();
          if (provider) {
            // Try to reconnect silently
            await connect();
          }
        } catch (error) {
          // Silent fail - user can manually reconnect
          console.warn('Auto-reconnect failed:', error);
          localStorage.removeItem('wallet_connected');
          localStorage.removeItem('wallet_address');
        }
      }
    };

    checkConnection().catch(console.warn);
  }, [connect]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect().catch(console.warn);
        } else if (accounts[0] !== state.address) {
          // Account changed, reconnect
          connect().catch(console.warn);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.request?.({ method: 'eth_accounts' })
        .then((accounts: any) => {
          if (Array.isArray(accounts) && accounts.length > 0) {
            // Auto-connect if already authorized
            if (!state.isConnected) {
              connect().catch(console.warn);
            }
          }
        })
        .catch(console.warn);

      // Listen for events
      if (window.ethereum?.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [state.address, state.isConnected, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendTransaction,
    sendUSDTTransaction,
  };
}
