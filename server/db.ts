import { asc, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, holdings, watchlist, financialData, valuations, priceHistory, allocations } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// Portfolio queries
export async function getUserHoldings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(holdings).where(eq(holdings.userId, userId));
}

export async function getUserWatchlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(watchlist).where(eq(watchlist.userId, userId));
}

export async function getHoldingByUserAndTicker(userId: number, ticker: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(holdings)
    .where(eq(holdings.userId, userId) && eq(holdings.ticker, ticker.toUpperCase()))
    .limit(1);
  return result[0];
}

export async function getFinancialData(ticker: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(financialData)
    .where(eq(financialData.ticker, ticker.toUpperCase()))
    .orderBy(desc(financialData.updatedAt))
    .limit(1);
  return result[0];
}

export async function getValuation(ticker: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(valuations)
    .where(eq(valuations.ticker, ticker.toUpperCase()))
    .orderBy(desc(valuations.calculatedAt))
    .limit(1);
  return result[0];
}

export async function getPriceHistory(ticker: string, days: number = 365) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return db.select().from(priceHistory)
    .where(eq(priceHistory.ticker, ticker.toUpperCase()) && gte(priceHistory.date, startDate))
    .orderBy(asc(priceHistory.date));
}

export async function getUserAllocations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(allocations).where(eq(allocations.userId, userId));
}
