import { pgTable, uuid, text, numeric, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const loanTypeEnum = pgEnum("loan_type", [
  "personal",
  "education",
  "vehicle",
  "home",
  "credit_line",
  "debt_consolidation",
]);

export const roleEnum = pgEnum("role", ["user", "assistant"]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  bank: text("bank").notNull(),
  type: loanTypeEnum("type").notNull(),
  rateApr: numeric("rate_apr", { precision: 5, scale: 2 }).notNull(),
  minIncome: numeric("min_income", { precision: 12, scale: 2 }).notNull(),
  minCreditScore: integer("min_credit_score").notNull(),
  tenureMinMonths: integer("tenure_min_months").default(6).notNull(),
  tenureMaxMonths: integer("tenure_max_months").default(60).notNull(),
  processingFeePct: numeric("processing_fee_pct", { precision: 5, scale: 2 }).default("0").notNull(),
  prepaymentAllowed: boolean("prepayment_allowed").default(true).notNull(),
  disbursalSpeed: text("disbursal_speed").default("standard").notNull(),
  docsLevel: text("docs_level").default("standard").notNull(),
  summary: text("summary"),
  faq: jsonb("faq").default("[]").notNull(),
  terms: jsonb("terms").default("{}").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiChatMessages = pgTable("ai_chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type NewAiChatMessage = typeof aiChatMessages.$inferInsert;

