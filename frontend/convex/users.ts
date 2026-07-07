import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const deleteById = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const updateEmailVerified = mutation({
  args: { id: v.id("users"), emailVerified: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { emailVerified: args.emailVerified });
    return { success: true };
  },
});

export const updatePassword = mutation({
  args: { id: v.id("users"), password: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { password: args.password });
    return { success: true };
  },
});

export const updateRole = mutation({
  args: { id: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
    return { success: true };
  },
});
