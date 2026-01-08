import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Watchlist: Stocks/crypto the user is monitoring
export const watchlist = mysqlTable("watchlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  assetType: mysqlEnum("assetType", ["stock", "crypto"]).default("stock").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = typeof watchlist.$inferInsert;

// Holdings: Active portfolio positions
export const holdings = mysqlTable("holdings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  assetType: mysqlEnum("assetType", ["stock", "crypto"]).default("stock").notNull(),
  shares: decimal("shares", { precision: 20, scale: 8 }).notNull(),
  averageCostBasis: decimal("averageCostBasis", { precision: 20, scale: 8 }).notNull(),
  totalCostBasis: decimal("totalCostBasis", { precision: 20, scale: 2 }).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Holdings = typeof holdings.$inferSelect;
export type InsertHoldings = typeof holdings.$inferInsert;

// Price history: Cache of historical prices for CAGR calculations
export const priceHistory = mysqlTable("priceHistory", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  assetType: mysqlEnum("assetType", ["stock", "crypto"]).default("stock").notNull(),
  date: timestamp("date").notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

// Financial data: Fundamental metrics for DCF calculations
export const financialData = mysqlTable("financialData", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  revenue: decimal("revenue", { precision: 20, scale: 2 }),
  operatingCashFlow: decimal("operatingCashFlow", { precision: 20, scale: 2 }),
  capex: decimal("capex", { precision: 20, scale: 2 }),
  totalDebt: decimal("totalDebt", { precision: 20, scale: 2 }),
  cash: decimal("cash", { precision: 20, scale: 2 }),
  sharesOutstanding: decimal("sharesOutstanding", { precision: 20, scale: 2 }),
  hasMoat: int("hasMoat").default(1).notNull(), // 1 = true, 0 = false
  growthRate: decimal("growthRate", { precision: 5, scale: 2 }).default("20").notNull(),
  wacc: decimal("wacc", { precision: 5, scale: 2 }).default("10").notNull(),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialData = typeof financialData.$inferSelect;
export type InsertFinancialData = typeof financialData.$inferInsert;

// Valuation: DCF results and margin of safety
export const valuations = mysqlTable("valuations", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  intrinsicValue: decimal("intrinsicValue", { precision: 20, scale: 8 }),
  marginOfSafety: decimal("marginOfSafety", { precision: 10, scale: 2 }),
  fcf: decimal("fcf", { precision: 20, scale: 2 }),
  fcfMargin: decimal("fcfMargin", { precision: 10, scale: 2 }),
  debtToEquity: decimal("debtToEquity", { precision: 10, scale: 2 }),
  vultureStatus: varchar("vultureStatus", { length: 50 }),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

export type Valuations = typeof valuations.$inferSelect;
export type InsertValuations = typeof valuations.$inferInsert;

// Allocation: User's portfolio allocation strategy
export const allocations = mysqlTable("allocations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }).notNull(),
  strategy: mysqlEnum("strategy", ["equal", "value-weighted", "conviction", "manual"]).default("manual").notNull(),
  accountType: mysqlEnum("accountType", ["brokerage", "roth-ira", "traditional-ira"]).default("brokerage").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Allocations = typeof allocations.$inferSelect;
export type InsertAllocations = typeof allocations.$inferInsert;