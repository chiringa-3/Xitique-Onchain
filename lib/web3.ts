import { ethers, BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";

export interface WalletProvider {
  isMetaMask?: boolean;
  isConnected?: () => boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: WalletProvider;
  }
}

// USDT contract addresses on different networks
const USDT_CONTRACTS = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
  295: "0x5C7e299CF531eb66f2A1dF637d37AbB78e6200C7", // Hedera Testnet USDT equivalent
  296: "0x00000000000000000000000000000000002625a0", // Hedera Mainnet
};

// Standard ERC-20 ABI for USDT operations
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

export class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async detectProvider(): Promise<WalletProvider | null> {
    if (typeof window !== "undefined" && window.ethereum) {
      return window.ethereum;
    }
    return null;
  }

  async connectWallet(): Promise<{ address: string; provider: BrowserProvider } | null> {
    try {
      const walletProvider = await this.detectProvider();
      if (!walletProvider) {
        throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
      }

      // Request account access
      const accounts = await walletProvider.request({
        method: "eth_requestAccounts",
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }

      // Create ethers provider
      this.provider = new BrowserProvider(walletProvider as any);
      this.signer = await this.provider.getSigner();

      const address = accounts[0];
      
      return {
        address,
        provider: this.provider,
      };
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      
      // Handle specific error codes
      if (error.code === 4001) {
        throw new Error("User rejected the connection request");
      } else if (error.code === -32002) {
        throw new Error("Connection request already pending. Please check your wallet.");
      }
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
  }

  async getUSDTBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    const network = await this.provider.getNetwork();
    const usdtAddress = USDT_CONTRACTS[Number(network.chainId) as keyof typeof USDT_CONTRACTS];
    
    if (!usdtAddress) {
      throw new Error(`USDT not supported on chain ${network.chainId}`);
    }

    const usdtContract = new Contract(usdtAddress, ERC20_ABI, this.provider);
    const balance = await usdtContract.balanceOf(address);
    const decimals = await usdtContract.decimals();
    
    return formatUnits(balance, decimals);
  }

  async sendUSDTTransaction(to: string, amount: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    const network = await this.provider!.getNetwork();
    const usdtAddress = USDT_CONTRACTS[Number(network.chainId) as keyof typeof USDT_CONTRACTS];
    
    if (!usdtAddress) {
      throw new Error(`USDT not supported on chain ${network.chainId}`);
    }

    const usdtContract = new Contract(usdtAddress, ERC20_ABI, this.signer);
    const decimals = await usdtContract.decimals();
    const amountInWei = parseUnits(amount, decimals);
    
    const tx = await usdtContract.transfer(to, amountInWei);
    return tx.hash;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    const balance = await this.provider.getBalance(address);
    return formatUnits(balance, 18);
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    const tx = await this.signer.sendTransaction({
      to,
      value: parseUnits(amount, 18),
    });

    return tx.hash;
  }

  async getNetwork(): Promise<{ name: string; chainId: number }> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    const network = await this.provider.getNetwork();
    return {
      name: network.name,
      chainId: Number(network.chainId),
    };
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }
}

export const web3Service = new Web3Service();
