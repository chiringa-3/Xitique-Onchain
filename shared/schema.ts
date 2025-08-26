import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, real, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  username: text("username"),
  email: text("email"),
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  symbol: varchar("symbol", { length: 10 }),
  contributionAmt: real("contribution_amt").notNull(), // Amount in USDT
  frequency: text("frequency").notNull(), // weekly, monthly etc.
  maxParticipants: integer("max_participants").notNull(),
  startDate: timestamp("start_date").notNull(),
  isPublic: boolean("is_public").default(true),
  creatorId: uuid("creator_id").notNull(),
  contractAddress: varchar("contract_address", { length: 42 }), // Blockchain contract address
  reputationNFTId: text("reputation_nft_id"),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("active"), // active, paused, finished
  priorityType: text("priority_type").default("lottery"), // lottery, vote, bid
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").notNull(),
  userId: uuid("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const contributions = pgTable("contributions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  groupId: uuid("group_id").notNull(),
  cycleId: uuid("cycle_id").notNull(),
  amount: real("amount").notNull(),
  paidAt: timestamp("paid_at").notNull(),
  isLate: boolean("is_late").default(false),
});

export const cycles = pgTable("cycles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").notNull(),
  cycleNumber: integer("cycle_number").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  recipientId: uuid("recipient_id"),
  isComplete: boolean("is_complete").default(false),
});

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cycleId: uuid("cycle_id").notNull(),
  voterId: uuid("voter_id").notNull(),
  nomineeId: uuid("nominee_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reputations = pgTable("reputations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  groupId: uuid("group_id").notNull(),
  score: integer("score").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Rewards System Tables
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // contribution, participation, social, milestone
  icon: text("icon").notNull(),
  rarity: text("rarity").notNull(), // common, rare, epic, legendary
  pointsReward: integer("points_reward").notNull(),
  badgeColor: text("badge_color").notNull(),
  requirements: text("requirements").notNull(), // JSON string with requirements
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  achievementId: uuid("achievement_id").notNull(),
  groupId: uuid("group_id"), // null for global achievements
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: integer("progress").default(0), // for tracking partial progress
  isCompleted: boolean("is_completed").default(true),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  groupId: uuid("group_id"),
  activityType: text("activity_type").notNull(), // join_group, contribute, win_cycle, vote, etc.
  pointsEarned: integer("points_earned").default(0),
  metadata: text("metadata"), // JSON string with additional data
  timestamp: timestamp("timestamp").defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  groupId: uuid("group_id").notNull(),
  streakType: text("streak_type").notNull(), // contribution, participation
  currentCount: integer("current_count").default(0),
  maxCount: integer("max_count").default(0),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  challengeType: text("challenge_type").notNull(), // daily, weekly, monthly, special
  requirements: text("requirements").notNull(), // JSON string
  pointsReward: integer("points_reward").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userChallenges = pgTable("user_challenges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  challengeId: uuid("challenge_id").notNull(),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
});

export const leaderboards = pgTable("leaderboards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  groupId: uuid("group_id"), // null for global leaderboard
  totalPoints: integer("total_points").default(0),
  contributionStreak: integer("contribution_streak").default(0),
  achievementsCount: integer("achievements_count").default(0),
  rank: integer("rank").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  groupMembers: many(groupMembers),
  contributions: many(contributions),
  reputations: many(reputations),
  votes: many(votes),
  createdGroups: many(groups),
  achievements: many(userAchievements),
  activityLogs: many(activityLogs),
  streaks: many(streaks),
  challenges: many(userChallenges),
  leaderboard: many(leaderboards),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.creatorId],
    references: [users.id],
  }),
  members: many(groupMembers),
  cycles: many(cycles),
  contributions: many(contributions),
  reputations: many(reputations),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  user: one(users, {
    fields: [contributions.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [contributions.groupId],
    references: [groups.id],
  }),
  cycle: one(cycles, {
    fields: [contributions.cycleId],
    references: [cycles.id],
  }),
}));

export const cyclesRelations = relations(cycles, ({ one, many }) => ({
  group: one(groups, {
    fields: [cycles.groupId],
    references: [groups.id],
  }),
  recipient: one(users, {
    fields: [cycles.recipientId],
    references: [users.id],
  }),
  contributions: many(contributions),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  cycle: one(cycles, {
    fields: [votes.cycleId],
    references: [cycles.id],
  }),
  voter: one(users, {
    fields: [votes.voterId],
    references: [users.id],
  }),
  nominee: one(users, {
    fields: [votes.nomineeId],
    references: [users.id],
  }),
}));

export const reputationsRelations = relations(reputations, ({ one }) => ({
  user: one(users, {
    fields: [reputations.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [reputations.groupId],
    references: [groups.id],
  }),
}));

// Activity Rewards Relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
  group: one(groups, {
    fields: [userAchievements.groupId],
    references: [groups.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [activityLogs.groupId],
    references: [groups.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [streaks.groupId],
    references: [groups.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  user: one(users, {
    fields: [leaderboards.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [leaderboards.groupId],
    references: [groups.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
});

export const insertCycleSchema = createInsertSchema(cycles).omit({
  id: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertReputationSchema = createInsertSchema(reputations).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;

export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type Contribution = typeof contributions.$inferSelect;

export type InsertCycle = z.infer<typeof insertCycleSchema>;
export type Cycle = typeof cycles.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type InsertReputation = z.infer<typeof insertReputationSchema>;
export type Reputation = typeof reputations.$inferSelect;

// Achievement schemas
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

// Activity Log schemas
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Streak schemas
export const insertStreakSchema = createInsertSchema(streaks).omit({
  id: true,
  lastActivityDate: true,
});
export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Streak = typeof streaks.$inferSelect;

// Challenge schemas
export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  completedAt: true,
});
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

// Leaderboard schemas
export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  lastUpdated: true,
});
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;
