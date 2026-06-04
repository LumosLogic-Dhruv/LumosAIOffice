import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const [users, companies, documents] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("companies").collect(),
      ctx.db.query("documents").collect(),
    ]);
    return {
      totalUsers: users.length,
      totalCompanies: companies.length,
      totalDocuments: documents.length,
    };
  },
});

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(({ password, ...u }) => u);
  },
});

export const listAllCompanies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});

export const listAllDocuments = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("documents").collect();
    return docs.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");

    const companyId = user.companyId;
    const companyUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (companyUsers.length <= 1) {
      // Last user in company — cascade delete everything
      const docs = await ctx.db
        .query("documents")
        .withIndex("by_company", (q) => q.eq("companyId", companyId))
        .collect();
      for (const doc of docs) await ctx.db.delete(doc._id);

      const clients = await ctx.db
        .query("clients")
        .withIndex("by_company", (q) => q.eq("companyId", companyId))
        .collect();
      for (const client of clients) await ctx.db.delete(client._id);

      const catalog = await ctx.db
        .query("catalog")
        .withIndex("by_company", (q) => q.eq("companyId", companyId))
        .collect();
      for (const item of catalog) await ctx.db.delete(item._id);

      await ctx.db.delete(companyId);
    } else if (user.role === "admin") {
      // Owner being removed — transfer ownership to another member
      const others = companyUsers.filter((u) => u._id !== args.id);
      const newOwner = others.find((u) => u.role !== "root") ?? others[0];
      if (newOwner) await ctx.db.patch(newOwner._id, { role: "admin" });
    }

    await ctx.db.delete(args.id);
  },
});

export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateUserRole = mutation({
  args: { id: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
    return await ctx.db.get(args.id);
  },
});

export const promoteByEmail = mutation({
  args: { email: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { role: args.role });
    return await ctx.db.get(user._id);
  },
});
