import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { priceHistory, financialData, valuations } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";

// Using Alpha Vantage API for reliable stock data
// For production, consider using a proxy or multiple data sources
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

interface StockPrice {
  ticker: string;
  price: number;
  timestamp: Date;
}

interface CryptoPrice {
  ticker: string;
  price: number;
  timestamp: Date;
}

/**
 * Fetch current stock price from Alpha Vantage
 */
export async function fetchStockPrice(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();
    const price = parseFloat(data["Global Quote"]?.["05. price"] || "0");
    return price > 0 ? price : null;
  } catch (error) {
    console.error(`Failed to fetch stock price for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch current crypto price from CoinGecko (free, reliable)
 */
export async function fetchCryptoPrice(cryptoId: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${cryptoId}&vs_currencies=usd`
    );
    const data = await response.json();
    const price = data[cryptoId]?.usd;
    return price ? parseFloat(price) : null;
  } catch (error) {
    console.error(`Failed to fetch crypto price for ${cryptoId}:`, error);
    return null;
  }
}

/**
 * Fetch historical stock data (1 year of daily prices)
 */
export async function fetchHistoricalStockData(
  ticker: string
): Promise<{ date: string; price: number }[]> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();
    const timeSeries = data["Time Series (Daily)"] || {};

    // Get last 365 days
    const prices = Object.entries(timeSeries)
      .slice(0, 365)
      .map(([date, values]: [string, any]) => ({
        date,
        price: parseFloat(values["4. close"] || "0"),
      }))
      .reverse();

    return prices;
  } catch (error) {
    console.error(`Failed to fetch historical data for ${ticker}:`, error);
    return [];
  }
}

/**
 * Fetch financial data from Alpha Vantage (requires company overview)
 */
export async function fetchCompanyFinancials(ticker: string) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();

    return {
      revenue: parseFloat(data.RevenueTTM || "0"),
      operatingCashFlow: parseFloat(data.OperatingCashFlowTTM || "0"),
      capex: parseFloat(data.CapitalExpenditureTTM || "0"),
      totalDebt: parseFloat(data.TotalDebt || "0"),
      cash: parseFloat(data.CashAndCashEquivalents || "0"),
      sharesOutstanding: parseFloat(data.SharesOutstanding || "0"),
    };
  } catch (error) {
    console.error(`Failed to fetch financials for ${ticker}:`, error);
    return null;
  }
}

/**
 * Cache price in database
 */
export async function cachePriceHistory(
  ticker: string,
  assetType: "stock" | "crypto",
  price: number,
  date: Date = new Date()
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(priceHistory).values({
      ticker: ticker.toUpperCase(),
      assetType,
      date,
      price: price.toString(),
      fetchedAt: new Date(),
    });
  } catch (error) {
    console.error(`Failed to cache price for ${ticker}:`, error);
  }
}

/**
 * Get latest cached price
 */
export async function getLatestPrice(ticker: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.ticker, ticker.toUpperCase()))
      .orderBy(desc(priceHistory.date))
      .limit(1);

    return result[0] ? parseFloat(result[0].price.toString()) : null;
  } catch (error) {
    console.error(`Failed to get cached price for ${ticker}:`, error);
    return null;
  }
}

/**
 * Crypto ticker to CoinGecko ID mapping
 */
const CRYPTO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  KAS: "kaspa",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
};

export function getCryptoId(ticker: string): string | null {
  return CRYPTO_MAP[ticker.toUpperCase()] || null;
}
