import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(),
    companyId: v.id("companies"),
    emailVerified: v.optional(v.boolean()),
  }).index("by_email", ["email"]),

  companies: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    gstNumber: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    cloudinaryLogoPublicId: v.optional(v.string()),
    defaultTerms: v.optional(v.string()),
    customFields: v.array(v.any()),
    inviteCode: v.optional(v.string()),
    colorTheme: v.optional(v.any()),
  }),

  documents: defineTable({
    companyId: v.id("companies"),
    type: v.string(),
    title: v.string(),
    clientName: v.string(),
    data: v.any(),
    pdfUrl: v.optional(v.string()),
    cloudinaryPdfPublicId: v.optional(v.string()),
    versionHistory: v.array(v.any()),
    updatedAt: v.number(),
    shareToken: v.optional(v.string()),
    shareExpiresAt: v.optional(v.number()),
    eSignature: v.optional(v.any()),
    status: v.optional(v.string()),
    expiryDate: v.optional(v.number()),
    paymentStatus: v.optional(v.string()),
  }).index("by_company", ["companyId"])
    .index("by_share_token", ["shareToken"])
    .index("by_company_updated", ["companyId", "updatedAt"]),

  clients: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    gstin: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_company", ["companyId"]),

  catalog: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    description: v.optional(v.string()),
    unit: v.optional(v.string()),
    rate: v.number(),
    category: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_company", ["companyId"]),

  activityLogs: defineTable({
    companyId: v.id("companies"),
    userId: v.string(),
    userName: v.string(),
    documentId: v.string(),
    documentTitle: v.string(),
    action: v.string(),
    timestamp: v.number(),
  }).index("by_company", ["companyId"]),

  signOtps: defineTable({
    shareToken: v.string(),
    email: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index("by_share_token", ["shareToken"]),

  passwordResetTokens: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_email", ["email"]),

  emailVerificationTokens: defineTable({
    userId: v.string(),
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"])
    .index("by_user", ["userId"]),
});
