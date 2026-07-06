import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MAX_LOGS_PER_COMPANY = 200;
const CLEANUP_THRESHOLD = 250;

export const log = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
    userName: v.string(),
    documentId: v.string(),
    documentTitle: v.string(),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLogs", {
      ...args,
      timestamp: Date.now(),
    });

    // Clean up oldest logs when threshold exceeded
    const all = await ctx.db
      .query("activityLogs")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("asc")
      .collect();

    if (all.length > CLEANUP_THRESHOLD) {
      const toDelete = all.slice(0, all.length - MAX_LOGS_PER_COMPANY);
      for (const log of toDelete) {
        await ctx.db.delete(log._id);
      }
    }
  },
});

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .take(100);
  },
});
