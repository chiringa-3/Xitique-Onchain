import { ethers } from "ethers";
import { XCFG } from "./config";
import { getSigner, getXContract } from "../lib/hedera";
import { Sim } from "./sim";

async function getTokenAddress(contract: ethers.Contract): Promise<string> {
  if (XCFG.tokenAddress) return XCFG.tokenAddress;
  if (typeof (contract as any).token === "function") return await (contract as any).token();
  throw new Error("Token address not set. Provide VITE_ERC20_ADDRESS or implement contract.token()");
}

export async function createGroup(name: string, weeklyAmountRaw: string) {
  if (!XCFG.fns.createGroup) { 
    return { simulated: true, groupId: Sim.createGroup(name, weeklyAmountRaw) }; 
  }
  const signer = await getSigner(); 
  const c = getXContract(signer);
  const tx = await (c as any)[XCFG.fns.createGroup](name, BigInt(weeklyAmountRaw));
  const rec = await tx.wait?.(); 
  return { txHash: rec?.hash ?? tx.hash };
}

export async function joinGroup(groupId: number, accountHint?: string) {
  if (!XCFG.fns.joinGroup) { 
    Sim.joinGroup(groupId, accountHint || "me"); 
    return { simulated: true }; 
  }
  const signer = await getSigner(); 
  const c = getXContract(signer);
  const tx = await (c as any)[XCFG.fns.joinGroup](BigInt(groupId));
  const rec = await tx.wait?.(); 
  return { txHash: rec?.hash ?? tx.hash };
}

export async function invite(groupId: number, invitee: string) {
  if (!XCFG.fns.invite) { 
    Sim.invite(groupId, invitee); 
    return { 
      simulated: true, 
      inviteLink: `${location.origin}/join?g=${groupId}&a=${invitee}` 
    }; 
  }
  const signer = await getSigner(); 
  const c = getXContract(signer);
  const tx = await (c as any)[XCFG.fns.invite](BigInt(groupId), invitee);
  const rec = await tx.wait?.(); 
  return { txHash: rec?.hash ?? tx.hash };
}

export async function contribute(groupId: number, humanAmount: string) {
  const signer = await getSigner(); 
  const c = getXContract(signer);
  const tokenAddr = await getTokenAddress(c);
  const token = new ethers.Contract(tokenAddr, [
    { "inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    { "inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
  ], signer);
  
  const dec = XCFG.tokenDecimals ?? (await (token as any).decimals?.() ?? 18);
  const amountRaw = ethers.parseUnits(humanAmount, dec);

  if (!XCFG.fns.contribute) { 
    const addr = await signer.getAddress(); 
    Sim.contribute(groupId, addr, amountRaw.toString()); 
    return { simulated: true }; 
  }

  // approve -> contribute
  const approveTx = await (token as any).approve(await c.getAddress(), amountRaw); 
  await approveTx.wait?.();
  const tx = await (c as any)[XCFG.fns.contribute](BigInt(groupId), amountRaw);
  const rec = await tx.wait?.(); 
  return { txHash: rec?.hash ?? tx.hash };
}

export async function payPenalty(groupId: number, humanAmount?: string) {
  if (!XCFG.fns.payPenalty) { 
    const signer = await getSigner(); 
    const addr = await signer.getAddress(); 
    Sim.payPenalty(groupId, addr, (humanAmount||"0")); 
    return { simulated: true }; 
  }
  
  const signer = await getSigner(); 
  const c = getXContract(signer);
  
  if (humanAmount && humanAmount !== "0") {
    const tokenAddr = await getTokenAddress(c);
    const token = new ethers.Contract(tokenAddr, [
      { "inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
    ], signer);
    
    const amountRaw = ethers.parseUnits(humanAmount, XCFG.tokenDecimals);
    const a = await (token as any).approve(await c.getAddress(), amountRaw); 
    await a.wait?.();
    const tx = await (c as any)[XCFG.fns.payPenalty](BigInt(groupId), amountRaw);
    const rec = await tx.wait?.(); 
    return { txHash: rec?.hash ?? tx.hash };
  } else {
    const tx = await (c as any)[XCFG.fns.payPenalty](BigInt(groupId));
    const rec = await tx.wait?.(); 
    return { txHash: rec?.hash ?? tx.hash };
  }
}

export async function vote(proposalId: number, choice: number | boolean) {
  if (!XCFG.fns.vote) return { simulated: true };
  const signer = await getSigner(); 
  const c = getXContract(signer);
  const tx = await (c as any)[XCFG.fns.vote](BigInt(proposalId), choice);
  const rec = await tx.wait?.(); 
  return { txHash: rec?.hash ?? tx.hash };
}

export const views = {
  async groupCount() {
    if (!XCFG.fns.groupCount) return Sim.count();
    const c = getXContract(); 
    const n = await (c as any)[XCFG.fns.groupCount](); 
    return Number(n);
  },
  
  async getGroup(groupId: number) {
    if (!XCFG.fns.getGroup) return Sim.getGroup(groupId);
    const c = getXContract(); 
    return await (c as any)[XCFG.fns.getGroup](BigInt(groupId));
  }
};