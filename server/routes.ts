import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGroupSchema, insertGroupMemberSchema, insertContributionSchema, insertCycleSchema, type InsertGroup } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/users/wallet/:address", async (req, res) => {
    try {
      const user = await storage.getUserByWalletAddress(req.params.address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Group routes - order matters! Specific routes before parameterized ones
  app.get("/api/groups/public", async (req, res) => {
    try {
      const groups = await storage.getPublicGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching public groups:", error);
      res.status(500).json({ message: "Failed to get public groups" });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to get group" });
    }
  });

  app.get("/api/users/:userId/groups", async (req, res) => {
    try {
      const groups = await storage.getGroupsByMember(req.params.userId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user groups" });
    }
  });

  // Custom API schema for group creation
  const createGroupApiSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    symbol: z.string().max(10).optional(),
    contributionAmt: z.number().positive("Contribution amount must be positive"),
    frequency: z.string().min(1, "Frequency is required"),
    maxParticipants: z.number().int().positive("Max participants must be a positive integer"),
    startDate: z.string().min(1, "Start date is required"),
    isPublic: z.boolean().optional().default(true),
    creatorId: z.string().min(1, "Creator ID is required"), // Wallet address
    contractAddress: z.string().optional().nullable(), // Blockchain contract address
    status: z.string().optional().default("active"),
    priorityType: z.string().optional().default("lottery"),
  });

  app.post("/api/groups", async (req, res) => {
    try {
      // Validate the API request
      const rawData = createGroupApiSchema.parse(req.body);
      
      // Find or create user for the wallet address
      let user = await storage.getUserByWalletAddress(rawData.creatorId);
      if (!user) {
        user = await storage.createUser({
          walletAddress: rawData.creatorId,
          username: `User ${rawData.creatorId.slice(-8)}`,
        });
      }
      
      // Prepare group data for database
      const groupData: InsertGroup = {
        name: rawData.name,
        description: rawData.description || null,
        symbol: rawData.symbol || null,
        contributionAmt: rawData.contributionAmt,
        frequency: rawData.frequency,
        maxParticipants: rawData.maxParticipants,
        startDate: new Date(rawData.startDate),
        isPublic: rawData.isPublic ?? true,
        creatorId: user.id,
        contractAddress: rawData.contractAddress || null,
        status: rawData.status || "active",
        priorityType: rawData.priorityType || "lottery",
        reputationNFTId: null,
      };
      
      // Create group
      const group = await storage.createGroup(groupData);
      
      // Add creator as first member
      await storage.addGroupMember({
        groupId: group.id,
        userId: user.id,
      });
      
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get("/api/groups/:id/members", async (req, res) => {
    try {
      const members = await storage.getGroupMembers(req.params.id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to get group members" });
    }
  });

  app.post("/api/groups/:id/members", async (req, res) => {
    try {
      const memberData = insertGroupMemberSchema.parse({
        groupId: req.params.id,
        ...req.body,
      });
      const member = await storage.addGroupMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add group member" });
    }
  });

  app.delete("/api/groups/:groupId/members/:memberId", async (req, res) => {
    try {
      // Get the member to verify it exists and get the userId
      const members = await storage.getGroupMembers(req.params.groupId);
      const member = members.find(m => m.id === req.params.memberId);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      await storage.removeGroupMember(req.params.groupId, member.userId);
      res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove group member" });
    }
  });

  // Contribution routes
  app.get("/api/groups/:id/contributions", async (req, res) => {
    try {
      const contributions = await storage.getContributionsByGroup(req.params.id);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get contributions" });
    }
  });

  app.post("/api/contributions", async (req, res) => {
    try {
      const contributionData = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(contributionData);
      res.status(201).json(contribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contribution data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contribution" });
    }
  });

  // Cycle routes
  app.get("/api/groups/:id/cycles", async (req, res) => {
    try {
      const cycles = await storage.getCyclesByGroup(req.params.id);
      res.json(cycles);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cycles" });
    }
  });

  app.get("/api/groups/:id/current-cycle", async (req, res) => {
    try {
      const cycle = await storage.getCurrentCycle(req.params.id);
      if (!cycle) {
        return res.status(404).json({ message: "No current cycle found" });
      }
      res.json(cycle);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current cycle" });
    }
  });

  app.post("/api/cycles", async (req, res) => {
    try {
      const cycleData = insertCycleSchema.parse(req.body);
      const cycle = await storage.createCycle(cycleData);
      res.status(201).json(cycle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cycle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create cycle" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
