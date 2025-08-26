import { ethers } from "ethers";
import { XCFG } from "./config";
import { getXContract } from "../lib/hedera";
import { GroupInfo } from "./groupStore";

export async function fetchGroupOnChain(groupId: number): Promise<GroupInfo | null> {
  if (!XCFG.fns.getGroup) return null;
  
  try {
    const c = getXContract();
    // Adapt this unpacking to your actual return type
    const g = await (c as any)[XCFG.fns.getGroup](BigInt(groupId));

    // Try to normalize: adjust field names as per your ABI
    // Example assumptions:
    // g.name, g.contributionAmount (uint256), g.frequencyDays (uint256), g.maxParticipants (uint256), g.token (address)
    const name = g.name ?? g[0] ?? `Group #${groupId}`;
    const contributionRaw = (g.contributionAmount ?? g[1] ?? 0n).toString();
    const frequencyDays = Number(g.frequencyDays ?? g[2] ?? 0);
    const maxParticipants = Number(g.maxParticipants ?? g[3] ?? 0);
    const token = g.usdtToken ?? g.token ?? g[4];

    return { id: groupId, name, contributionRaw, frequencyDays, maxParticipants, token };
  } catch (error) {
    console.warn(`Failed to fetch group ${groupId} from chain:`, error);
    return null;
  }
}

export function buildGroupFromLocal(
  groupId: number, 
  name: string, 
  contributionRaw: string, 
  extras?: Partial<GroupInfo>
): GroupInfo {
  return {
    id: groupId,
    name,
    contributionRaw,
    frequencyDays: extras?.frequencyDays,
    maxParticipants: extras?.maxParticipants,
    token: extras?.token
  };
}