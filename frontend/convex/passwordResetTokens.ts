import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Invalidate any existing unused tokens for this email
    const existing = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("used"), false))
      .collect();
    for (const t of existing) {
      await ctx.db.patch(t._id, { used: true });
    }
    return await ctx.db.insert("passwordResetTokens", {
      email: args.email,
      token: args.token,
      expiresAt: args.expiresAt,
      used: false,
    });
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});

export const markUsed = mutation({
  args: { id: v.id("passwordResetTokens") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { used: true });
  },
});
