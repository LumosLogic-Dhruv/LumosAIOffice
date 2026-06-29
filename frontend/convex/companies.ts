import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    customFields: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("companies", {
      name: args.name,
      email: args.email,
      customFields: args.customFields ?? [],
    });
  },
});

export const getById = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    gstNumber: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    cloudinaryLogoPublicId: v.optional(v.string()),
    defaultTerms: v.optional(v.string()),
    customFields: v.optional(v.array(v.any())),
    inviteCode: v.optional(v.string()),
    colorTheme: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("inviteCode"), args.inviteCode))
      .first();
  },
});

export const addCustomField = mutation({
  args: {
    id: v.id("companies"),
    field: v.object({ fieldName: v.string(), fieldType: v.string() }),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    if (!company) throw new Error("Company not found");
    const updated = [...(company.customFields ?? []), { ...args.field, _id: crypto.randomUUID() }];
    await ctx.db.patch(args.id, { customFields: updated });
    return await ctx.db.get(args.id);
  },
});

export const removeCustomField = mutation({
  args: {
    id: v.id("companies"),
    fieldId: v.string(),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    if (!company) throw new Error("Company not found");
    const updated = (company.customFields ?? []).filter((f: any) => f._id !== args.fieldId);
    await ctx.db.patch(args.id, { customFields: updated });
    return await ctx.db.get(args.id);
  },
});
