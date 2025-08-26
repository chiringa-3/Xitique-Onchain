import { 
  users, groups, groupMembers, contributions, cycles, votes, reputations,
  type User, type InsertUser, type Group, type InsertGroup,
  type GroupMember, type InsertGroupMember, type Contribution, type InsertContribution,
  type Cycle, type InsertCycle, type Vote, type InsertVote,
  type Reputation, type InsertReputation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Groups
  getGroup(id: string): Promise<Group | undefined>;
  getGroupsByCreator(creatorId: string): Promise<Group[]>;
  getGroupsByMember(userId: string): Promise<Group[]>;
  getPublicGroups(): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroupStatus(id: string, status: string): Promise<void>;
  
  // Group Members
  getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: string, userId: string): Promise<void>;
  
  // Contributions
  getContributionsByGroup(groupId: string): Promise<Contribution[]>;
  getContributionsByUser(userId: string): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  
  // Cycles
  getCyclesByGroup(groupId: string): Promise<Cycle[]>;
  getCurrentCycle(groupId: string): Promise<Cycle | undefined>;
  createCycle(cycle: InsertCycle): Promise<Cycle>;
  updateCycleRecipient(cycleId: string, recipientId: string): Promise<void>;
  completeCycle(cycleId: string): Promise<void>;
  
  // Votes
  getVotesByCycle(cycleId: string): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  
  // Reputations
  getUserReputation(userId: string, groupId: string): Promise<Reputation | undefined>;
  updateReputation(userId: string, groupId: string, score: number): Promise<void>;
  
  // Dashboard stats
  getUserStats(userId: string): Promise<{
    totalGroups: number;
    totalSaved: number;
    reputationScore: number;
    nftsOwned: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getGroup(id: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group || undefined;
  }

  async getGroupsByCreator(creatorId: string): Promise<Group[]> {
    return await db.select().from(groups).where(eq(groups.creatorId, creatorId));
  }

  async getGroupsByMember(userId: string): Promise<Group[]> {
    return await db
      .select({ 
        id: groups.id,
        name: groups.name,
        description: groups.description,
        symbol: groups.symbol,
        contributionAmt: groups.contributionAmt,
        frequency: groups.frequency,
        maxParticipants: groups.maxParticipants,
        startDate: groups.startDate,
        isPublic: groups.isPublic,
        creatorId: groups.creatorId,
        contractAddress: groups.contractAddress,
        reputationNFTId: groups.reputationNFTId,
        createdAt: groups.createdAt,
        status: groups.status,
        priorityType: groups.priorityType,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.isActive, true)));
  }

  async getPublicGroups(): Promise<Group[]> {
    return await db.select().from(groups).where(eq(groups.isPublic, true)).orderBy(desc(groups.createdAt));
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async updateGroupStatus(id: string, status: string): Promise<void> {
    await db.update(groups).set({ status }).where(eq(groups.id, id));
  }

  async getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]> {
    return await db
      .select({
        id: groupMembers.id,
        groupId: groupMembers.groupId,
        userId: groupMembers.userId,
        joinedAt: groupMembers.joinedAt,
        isActive: groupMembers.isActive,
        user: users,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.isActive, true)));
  }

  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [newMember] = await db.insert(groupMembers).values(member).returning();
    return newMember;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    await db
      .update(groupMembers)
      .set({ isActive: false })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
  }

  async getContributionsByGroup(groupId: string): Promise<Contribution[]> {
    return await db.select().from(contributions).where(eq(contributions.groupId, groupId));
  }

  async getContributionsByUser(userId: string): Promise<Contribution[]> {
    return await db.select().from(contributions).where(eq(contributions.userId, userId));
  }

  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const [newContribution] = await db.insert(contributions).values(contribution).returning();
    return newContribution;
  }

  async getCyclesByGroup(groupId: string): Promise<Cycle[]> {
    return await db.select().from(cycles).where(eq(cycles.groupId, groupId)).orderBy(cycles.cycleNumber);
  }

  async getCurrentCycle(groupId: string): Promise<Cycle | undefined> {
    const [cycle] = await db
      .select()
      .from(cycles)
      .where(and(eq(cycles.groupId, groupId), eq(cycles.isComplete, false)))
      .orderBy(desc(cycles.cycleNumber))
      .limit(1);
    return cycle || undefined;
  }

  async createCycle(cycle: InsertCycle): Promise<Cycle> {
    const [newCycle] = await db.insert(cycles).values(cycle).returning();
    return newCycle;
  }

  async updateCycleRecipient(cycleId: string, recipientId: string): Promise<void> {
    await db.update(cycles).set({ recipientId }).where(eq(cycles.id, cycleId));
  }

  async completeCycle(cycleId: string): Promise<void> {
    await db.update(cycles).set({ isComplete: true }).where(eq(cycles.id, cycleId));
  }

  async getVotesByCycle(cycleId: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.cycleId, cycleId));
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db.insert(votes).values(vote).returning();
    return newVote;
  }

  async getUserReputation(userId: string, groupId: string): Promise<Reputation | undefined> {
    const [reputation] = await db
      .select()
      .from(reputations)
      .where(and(eq(reputations.userId, userId), eq(reputations.groupId, groupId)));
    return reputation || undefined;
  }

  async updateReputation(userId: string, groupId: string, score: number): Promise<void> {
    const existingRep = await this.getUserReputation(userId, groupId);
    if (existingRep) {
      await db
        .update(reputations)
        .set({ score, updatedAt: new Date() })
        .where(and(eq(reputations.userId, userId), eq(reputations.groupId, groupId)));
    } else {
      await db.insert(reputations).values({ userId, groupId, score });
    }
  }

  async getUserStats(userId: string): Promise<{
    totalGroups: number;
    totalSaved: number;
    reputationScore: number;
    nftsOwned: number;
  }> {
    // Get total groups
    const userGroups = await this.getGroupsByMember(userId);
    const totalGroups = userGroups.length;

    // Get total saved (sum of all contributions)
    const userContributions = await this.getContributionsByUser(userId);
    const totalSaved = userContributions.reduce((sum, contrib) => sum + contrib.amount, 0);

    // Get total reputation score across all groups
    const [reputationResult] = await db
      .select({ totalScore: sql<number>`COALESCE(SUM(${reputations.score}), 0)` })
      .from(reputations)
      .where(eq(reputations.userId, userId));
    
    const reputationScore = reputationResult?.totalScore || 0;

    // NFTs owned = number of groups (one NFT per group participation)
    const nftsOwned = totalGroups;

    return {
      totalGroups,
      totalSaved,
      reputationScore,
      nftsOwned,
    };
  }
}

export const storage = new DatabaseStorage();
