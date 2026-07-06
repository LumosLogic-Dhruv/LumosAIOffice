import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Delete any existing tokens for this user before creating a new one
    const existing = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const t of existing) {
      await ctx.db.delete(t._id);
    }
    return await ctx.db.insert("emailVerificationTokens", {
      userId: args.userId,
      email: args.email,
      token: args.token,
      expiresAt: args.expiresAt,
    });
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});

export const deleteById = mutation({
  args: { id: v.id("emailVerificationTokens") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
