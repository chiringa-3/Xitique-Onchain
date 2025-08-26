import { ethers, Contract, formatUnits, parseUnits } from "ethers";
import { web3Service } from "./web3";

// Xitique smart contract ABI - matches your deployed contract
export const XITIQUE_GROUP_ABI = [
  // Events
  "event MemberJoined(address indexed member)",
  "event ContributionMade(address indexed member, uint256 amount, uint256 cycleId)",
  "event CycleCompleted(uint256 indexed cycleId, address indexed beneficiary, uint256 amount)",
  "event BidPlaced(uint256 indexed cycleId, address indexed bidder, uint256 amount)",

  // View functions - matching your deployed contract
  "function getGroupInfo() view returns (tuple(string name, string symbol, uint256 contributionAmount, uint256 frequencyDays, uint256 maxParticipants, uint256 totalMembers, uint256 activeMembersCount, uint256 currentCycle, address creator, bool isActive))",
  "function getCurrentCycleInfo() view returns (tuple(uint256 id, uint256 startTime, uint256 dueTime, uint256 totalContributed, uint256 contributors, address beneficiary, uint8 selectionMode, bool finalized, address highestBidder, uint256 highestBid))",
  "function getMemberList() view returns (address[])",
  "function isMember(address account) view returns (bool)",
  "function members(address) view returns (bool)",
  "function memberContributions(address) view returns (uint256)",
  "function hasReceivedPayout(address) view returns (bool)",
  "function currentCycleId() view returns (uint256)",
  "function owner() view returns (address)",
  "function usdtToken() view returns (address)",

  // State-changing functions - matching your deployed contract
  "function joinGroup() external",
  "function contribute() external",
  "function placeBid(uint256 amount) external"
];

// Selection mode enum mapping - matches your deployed contract
export enum SelectionMode {
  LOTTERY = 0,
  AUCTION = 1,
  VOTE = 2,
}

// Status enum mapping
export enum GroupStatus {
  Active = 0,
  Paused = 1,
  Ended = 2,
}

// Proposal type enum mapping
export enum ProposalType {
  ChangeRule = 0,
  RemoveMember = 1,
  PauseGroup = 2,
  ResumeGroup = 3,
  EndGroup = 4,
}

export interface ContractGroupInfo {
  id: string;
  name: string;
  symbol: string;
  contributionAmount: string;
  frequencyDays: number;
  maxParticipants: number;
  status: GroupStatus;
  creator: string;
  totalMembers: number;
  activeMembersCount: number;
}

export interface CycleInfo {
  id: number;
  startTime: number;
  dueTime: number;
  totalContributed: string;
  contributors: number;
  beneficiary: string;
  selectionMode: SelectionMode;
  finalized: boolean;
  highestBidder: string;
  highestBid: string;
}

export interface ProposalInfo {
  id: number;
  proposalType: ProposalType;
  paramAddress: string;
  paramUint: number;
  yesVotes: number;
  noVotes: number;
  executed: boolean;
}

// Contract deployment and management service
export class XitiqueContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contractAddress: string | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        // Don't await getSigner in constructor to avoid unhandled promise rejection
      }
    } catch (error) {
      console.warn('Failed to initialize Web3 provider:', error);
    }
  }

  private async ensureSigner(): Promise<ethers.Signer> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    if (!this.signer) {
      this.signer = await this.provider.getSigner();
    }
    return this.signer;
  }

  // Get the deployed contract address from environment
  getDeployedContractAddress(): string {
    const address = import.meta.env.VITE_XITIQUE_ADDRESS;
    if (!address) {
      throw new Error('VITE_XITIQUE_ADDRESS environment variable not set. Please deploy the contract first.');
    }
    return address;
  }

  // Deploy a new Xitique group contract - returns existing deployed contract
  async deployGroupContract(params: {
    name: string;
    symbol: string;
    contributionAmount: number; // in USDT
    frequencyDays: number;
    maxParticipants: number;
  }): Promise<string> {
    try {
      // Use the already deployed contract
      const contractAddress = this.getDeployedContractAddress();
      console.log(`Using deployed Xitique contract at: ${contractAddress}`);
      console.log('Contract parameters (for reference):', params);

      // Connect to the existing contract to verify it works
      await this.connectToContract(contractAddress);
      
      return contractAddress;
    } catch (error) {
      console.error('Contract connection failed:', error);
      throw new Error(`Failed to connect to deployed contract: ${error}`);
    }
  }

  // Connect to an existing contract
  async connectToContract(contractAddress: string): Promise<void> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    this.contractAddress = contractAddress;
  }

  // Get contract instance
  getContractInstance(contractAddress: string): Contract {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return new Contract(contractAddress, XITIQUE_GROUP_ABI, this.provider);
  }

  // Get contract instance with signer for transactions
  async getContractWithSigner(contractAddress: string): Promise<Contract> {
    const signer = await this.ensureSigner();
    return new Contract(contractAddress, XITIQUE_GROUP_ABI, signer);
  }

  async getGroupInfo(contractAddress?: string): Promise<ContractGroupInfo> {
    const address = contractAddress || this.contractAddress || this.getDeployedContractAddress();
    
    const contract = this.getContractInstance(address);
    const groupInfo = await contract.getGroupInfo();

    return {
      id: address,
      name: groupInfo.name,
      symbol: groupInfo.symbol,
      contributionAmount: formatUnits(groupInfo.contributionAmount, 6), // USDT has 6 decimals
      frequencyDays: Number(groupInfo.frequencyDays),
      maxParticipants: Number(groupInfo.maxParticipants),
      status: groupInfo.isActive ? GroupStatus.Active : GroupStatus.Ended,
      creator: groupInfo.creator,
      totalMembers: Number(groupInfo.totalMembers),
      activeMembersCount: Number(groupInfo.activeMembersCount),
    };
  }

  async getCurrentCycleInfo(contractAddress?: string): Promise<CycleInfo | null> {
    const address = contractAddress || this.contractAddress || this.getDeployedContractAddress();
    
    const contract = this.getContractInstance(address);
    const cycleInfo = await contract.getCurrentCycleInfo();

    if (Number(cycleInfo.id) === 0) {
      return null; // No active cycle
    }

    return {
      id: Number(cycleInfo.id),
      startTime: Number(cycleInfo.startTime),
      dueTime: Number(cycleInfo.dueTime),
      totalContributed: formatUnits(cycleInfo.totalContributed, 6),
      contributors: Number(cycleInfo.contributors),
      beneficiary: cycleInfo.beneficiary,
      selectionMode: Number(cycleInfo.selectionMode) as SelectionMode,
      finalized: cycleInfo.finalized,
      highestBidder: cycleInfo.highestBidder,
      highestBid: formatUnits(cycleInfo.highestBid, 6),
    };
  }

  // Join a group
  async joinGroup(contractAddress?: string): Promise<void> {
    const address = contractAddress || this.getDeployedContractAddress();
    const contract = await this.getContractWithSigner(address);
    const tx = await contract.joinGroup();
    await tx.wait();
  }

  // Contribute to current cycle
  async contribute(contractAddress?: string): Promise<void> {
    const address = contractAddress || this.getDeployedContractAddress();
    const contract = await this.getContractWithSigner(address);
    const tx = await contract.contribute();
    await tx.wait();
  }

  // Place a bid for current cycle
  async placeBid(amount: number, contractAddress?: string): Promise<void> {
    const address = contractAddress || this.getDeployedContractAddress();
    const contract = await this.getContractWithSigner(address);
    const amountWei = parseUnits(amount.toString(), 6); // USDT has 6 decimals
    const tx = await contract.placeBid(amountWei);
    await tx.wait();
  }

  // Get member list
  async getMemberList(contractAddress?: string): Promise<string[]> {
    const address = contractAddress || this.getDeployedContractAddress();
    const contract = this.getContractInstance(address);
    return await contract.getMemberList();
  }

  // Check if user is a member
  async isMember(userAddress: string, contractAddress?: string): Promise<boolean> {
    const address = contractAddress || this.getDeployedContractAddress();
    const contract = this.getContractInstance(address);
    return await contract.isMember(userAddress);
  }

  // Cast vote for a nominee
  async castVote(contractAddress: string, nominee: string): Promise<void> {
    const contract = await this.getContractWithSigner(contractAddress);
    const tx = await contract.castVote(nominee);
    await tx.wait();
  }

  // Create a proposal
  async createProposal(
    contractAddress: string,
    proposalType: ProposalType,
    paramAddress: string = ethers.ZeroAddress,
    paramUint: number = 0
  ): Promise<number> {
    const contract = await this.getContractWithSigner(contractAddress);
    const tx = await contract.createProposal(proposalType, paramAddress, paramUint);
    const receipt = await tx.wait();
    
    // Extract proposal ID from events
    const event = receipt.logs.find((log: any) => 
      log.fragment && log.fragment.name === 'ProposalCreated'
    );
    return event ? Number(event.args.proposalId) : 0;
  }

  // Vote on a proposal
  async voteProposal(contractAddress: string, proposalId: number, support: boolean): Promise<void> {
    const contract = await this.getContractWithSigner(contractAddress);
    const tx = await contract.voteProposal(proposalId, support);
    await tx.wait();
  }
}

export const xitiqueContractService = new XitiqueContractService();