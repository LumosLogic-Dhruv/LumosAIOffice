import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
    return docs.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    type: v.string(),
    title: v.string(),
    clientName: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("documents", {
      ...args,
      pdfUrl: undefined,
      cloudinaryPdfPublicId: undefined,
      versionHistory: [],
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const getByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    data: v.optional(v.any()),
    title: v.optional(v.string()),
    clientName: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    cloudinaryPdfPublicId: v.optional(v.string()),
    shareToken: v.optional(v.union(v.string(), v.null())),
    shareExpiresAt: v.optional(v.union(v.number(), v.null())),
    eSignature: v.optional(v.any()),
    status: v.optional(v.string()),
    expiryDate: v.optional(v.union(v.number(), v.null())),
    versionSnapshot: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, versionSnapshot, ...fields } = args;
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");

    const patch: any = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) {
        if (val === null) {
          patch[k] = undefined; // Convex uses undefined to unset optional fields
        } else {
          patch[k] = val;
        }
      }
    }

    if (versionSnapshot !== undefined) {
      patch.versionHistory = [...(doc.versionHistory ?? []), versionSnapshot];
    }

    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

export const getHistory = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    return doc?.versionHistory ?? [];
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
