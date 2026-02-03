import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";
export * from "./models/chat";

// Blueprint tiers
export const blueprintTiers = ["free", "starter", "growth", "enterprise", "pressing", "boring"] as const;
export type BlueprintTier = typeof blueprintTiers[number];

// Blueprints table - the core product
export const blueprints = pgTable("blueprints", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  tier: text("tier").notNull().$type<BlueprintTier>(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  isPublished: boolean("is_published").default(true),
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Purchases table - tracks what users bought
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  blueprintId: integer("blueprint_id").notNull().references(() => blueprints.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSessionId: text("stripe_session_id"),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// PDF download tracking
export const pdfDownloads = pgTable("pdf_downloads", {
  id: serial("id").primaryKey(),
  blueprintId: integer("blueprint_id").notNull().references(() => blueprints.id),
  userId: varchar("user_id"),
  userEmail: text("user_email"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Research sessions for admin AI tool
export const researchSessions = pgTable("research_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  topic: text("topic").notNull(),
  searchResults: text("search_results"),
  analysis: text("analysis"),
  generatedContent: text("generated_content"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Relations
export const blueprintsRelations = relations(blueprints, ({ many }) => ({
  purchases: many(purchases),
  downloads: many(pdfDownloads),
}));

export const pdfDownloadsRelations = relations(pdfDownloads, ({ one }) => ({
  blueprint: one(blueprints, {
    fields: [pdfDownloads.blueprintId],
    references: [blueprints.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  blueprint: one(blueprints, {
    fields: [purchases.blueprintId],
    references: [blueprints.id],
  }),
}));

// Insert schemas
export const insertBlueprintSchema = createInsertSchema(blueprints).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export const insertResearchSessionSchema = createInsertSchema(researchSessions).omit({
  id: true,
  createdAt: true,
});

export const insertPdfDownloadSchema = createInsertSchema(pdfDownloads).omit({
  id: true,
  createdAt: true,
});

// Types
export type Blueprint = typeof blueprints.$inferSelect;
export type InsertBlueprint = z.infer<typeof insertBlueprintSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type ResearchSession = typeof researchSessions.$inferSelect;
export type InsertResearchSession = z.infer<typeof insertResearchSessionSchema>;
export type PdfDownload = typeof pdfDownloads.$inferSelect;
export type InsertPdfDownload = z.infer<typeof insertPdfDownloadSchema>;
