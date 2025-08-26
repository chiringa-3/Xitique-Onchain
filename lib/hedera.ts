import { ethers } from "ethers";
import TokenAbi from "../abi/Token.json";
import XitiqueAbi from "../xitique/abi/Xitique.json";

export const RPC_URL = import.meta.env.VITE_HEDERA_RPC_URL!;
export const CHAIN_ID = Number(import.meta.env.VITE_HEDERA_CHAIN_ID || 296);
export const CONTRACT_ADDRESS = import.meta.env.VITE_XITIQUE_ADDRESS!;
export const XITIQUE_ADDRESS = import.meta.env.VITE_XITIQUE_ADDRESS!;

declare global { 
  interface Window { 
    ethereum?: {
      request: (args: any) => Promise<any>;
      on?: (event: string, callback: Function) => void;
    };
  } 
}

const ABI: any = TokenAbi;

export function getProvider() {
  return window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
}

export async function ensureHederaNetwork() {
  if (!window.ethereum) return;
  const hex = "0x" + CHAIN_ID.toString(16);
  const current = await window.ethereum.request({ method: "eth_chainId" });
  if (current !== hex) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hex }]
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: hex,
            chainName: "Hedera Testnet",
            nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: ["https://hashscan.io/testnet/"]
          }]
        });
      } else { throw err; }
    }
  }
}

export async function getSigner() {
  if (window.ethereum) await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureHederaNetwork();
  return (await getProvider()).getSigner();
}

export function getContract(signerOrProvider?: any) {
  const p = signerOrProvider ?? getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, p);
}

export function getXContract(signerOrProvider?: any) {
  const abi: any = (XitiqueAbi as any).abi ?? XitiqueAbi;
  const p = signerOrProvider ?? getProvider();
  return new ethers.Contract(XITIQUE_ADDRESS, abi, p);
}