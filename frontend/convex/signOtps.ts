import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    shareToken: v.string(),
    email: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Invalidate any existing unused OTPs for this share token
    const existing = await ctx.db
      .query("signOtps")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .filter((q) => q.eq(q.field("used"), false))
      .collect();
    for (const otp of existing) {
      await ctx.db.patch(otp._id, { used: true });
    }
    return await ctx.db.insert("signOtps", { ...args, used: false });
  },
});

export const getByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("signOtps")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .filter((q) => q.eq(q.field("used"), false))
      .order("desc")
      .first();
  },
});

export const markUsed = mutation({
  args: { id: v.id("signOtps") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { used: true });
  },
});
