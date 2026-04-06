import type { DataProvider, CompanyProfile, PriceBar, IncomeStatement, BalanceSheet, CashFlowStatement, KeyMetrics } from "./types"

// ─── Deterministic random number generator ────────────────────────────────────
// Uses a fixed seed so data is identical on every run.
function makeLCG(seed: number) {
  let s = seed >>> 0
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0
    return s / 0xffffffff
  }
}

// ─── Generate ~5 years of daily OHLCV bars ────────────────────────────────────
function generatePriceBars(): PriceBar[] {
  const rand = makeLCG(42)
  const bars: PriceBar[] = []
  let price = 120
  const start = new Date("2020-01-02")
  const end   = new Date("2025-12-31")

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue

    const drift   = 0.00035
    const daily   = (rand() - 0.49) * 0.026 + drift
    const open    = price * (1 + (rand() - 0.5) * 0.006)
    const close   = open  * (1 + daily)
    const high    = Math.max(open, close) * (1 + rand() * 0.009)
    const low     = Math.min(open, close) * (1 - rand() * 0.009)
    const volume  = Math.floor(2_000_000 + rand() * 9_000_000)

    bars.push({
      date:   d.toISOString().split("T")[0],
      open:   Math.round(open  * 100) / 100,
      high:   Math.round(high  * 100) / 100,
      low:    Math.round(low   * 100) / 100,
      close:  Math.round(close * 100) / 100,
      volume,
    })
    price = close
  }
  return bars
}

const ALL_BARS = generatePriceBars()

// ─── Profile ──────────────────────────────────────────────────────────────────
const PROFILE: CompanyProfile = {
  ticker:      "DEMO",
  name:        "FinSight Demo Corp",
  exchange:    "NASDAQ",
  sector:      "Technology",
  industry:    "Software — Application",
  description: "FinSight Demo Corp is a fictional enterprise software company used for UI development and testing. It operates a cloud-based financial analytics platform serving institutional investors, asset managers, and hedge funds across North America and Europe. The company was founded in 2005 and is headquartered in San Francisco, CA.",
  marketCap:   52_400_000_000,
  employees:   14_800,
  website:     "https://demo.finsight.com",
  ceo:         "Alexandra Chen",
  country:     "US",
}

// ─── Key Metrics (TTM) ────────────────────────────────────────────────────────
const METRICS: KeyMetrics = {
  ticker:          "DEMO",
  peRatio:         28.4,
  pbRatio:         6.2,
  evToEbitda:      19.8,
  debtToEquity:    0.41,
  returnOnEquity:  0.231,
  returnOnAssets:  0.112,
  currentRatio:    1.84,
  grossMargin:     0.674,
  operatingMargin: 0.221,
  netMargin:       0.183,
}

// ─── Income Statements (annual, most recent first) ───────────────────────────
const INCOME: IncomeStatement[] = [
  { fiscalYear: 2024, period: "annual", revenue: 12_180_000_000, grossProfit: 8_209_000_000, operatingIncome: 2_692_000_000, netIncome: 2_229_000_000, ebitda: 3_140_000_000, eps: 4.18, epsDiluted: 4.11, shares: 533_000_000 },
  { fiscalYear: 2023, period: "annual", revenue: 10_750_000_000, grossProfit: 7_148_000_000, operatingIncome: 2_257_000_000, netIncome: 1_860_000_000, ebitda: 2_710_000_000, eps: 3.49, epsDiluted: 3.43, shares: 543_000_000 },
  { fiscalYear: 2022, period: "annual", revenue:  9_420_000_000, grossProfit: 6_130_000_000, operatingIncome: 1_884_000_000, netIncome: 1_507_000_000, ebitda: 2_290_000_000, eps: 2.79, epsDiluted: 2.74, shares: 552_000_000 },
  { fiscalYear: 2021, period: "annual", revenue:  8_210_000_000, grossProfit: 5_248_000_000, operatingIncome: 1_478_000_000, netIncome: 1_150_000_000, ebitda: 1_890_000_000, eps: 2.08, epsDiluted: 2.04, shares: 561_000_000 },
  { fiscalYear: 2020, period: "annual", revenue:  7_090_000_000, grossProfit: 4_396_000_000, operatingIncome: 1_063_000_000, netIncome:   779_000_000, ebitda: 1_430_000_000, eps: 1.39, epsDiluted: 1.36, shares: 570_000_000 },
]

// ─── Balance Sheets ───────────────────────────────────────────────────────────
const BALANCE: BalanceSheet[] = [
  { fiscalYear: 2024, period: "annual", totalAssets: 38_500_000_000, totalLiabilities: 17_200_000_000, totalEquity: 21_300_000_000, cash: 8_100_000_000, totalDebt: 5_900_000_000, netDebt: -2_200_000_000 },
  { fiscalYear: 2023, period: "annual", totalAssets: 34_200_000_000, totalLiabilities: 15_800_000_000, totalEquity: 18_400_000_000, cash: 6_900_000_000, totalDebt: 5_900_000_000, netDebt:  -1_000_000_000 },
  { fiscalYear: 2022, period: "annual", totalAssets: 30_100_000_000, totalLiabilities: 14_400_000_000, totalEquity: 15_700_000_000, cash: 5_400_000_000, totalDebt: 5_900_000_000, netDebt:     500_000_000 },
  { fiscalYear: 2021, period: "annual", totalAssets: 26_800_000_000, totalLiabilities: 13_200_000_000, totalEquity: 13_600_000_000, cash: 4_200_000_000, totalDebt: 5_400_000_000, netDebt:   1_200_000_000 },
  { fiscalYear: 2020, period: "annual", totalAssets: 23_900_000_000, totalLiabilities: 12_600_000_000, totalEquity: 11_300_000_000, cash: 3_600_000_000, totalDebt: 5_400_000_000, netDebt:   1_800_000_000 },
]

// ─── Cash Flow Statements ─────────────────────────────────────────────────────
const CASHFLOW: CashFlowStatement[] = [
  { fiscalYear: 2024, period: "annual", operatingCashFlow: 3_180_000_000, capitalExpenditures:  -420_000_000, freeCashFlow: 2_760_000_000, dividendsPaid:  -480_000_000 },
  { fiscalYear: 2023, period: "annual", operatingCashFlow: 2_720_000_000, capitalExpenditures:  -390_000_000, freeCashFlow: 2_330_000_000, dividendsPaid:  -420_000_000 },
  { fiscalYear: 2022, period: "annual", operatingCashFlow: 2_210_000_000, capitalExpenditures:  -360_000_000, freeCashFlow: 1_850_000_000, dividendsPaid:  -360_000_000 },
  { fiscalYear: 2021, period: "annual", operatingCashFlow: 1_740_000_000, capitalExpenditures:  -310_000_000, freeCashFlow: 1_430_000_000, dividendsPaid:  -300_000_000 },
  { fiscalYear: 2020, period: "annual", operatingCashFlow: 1_280_000_000, capitalExpenditures:  -270_000_000, freeCashFlow: 1_010_000_000, dividendsPaid:  -240_000_000 },
]

// ─── Mock search results for "DEMO" ───────────────────────────────────────────
const SEARCH_RESULT = [{ ticker: "DEMO", name: "FinSight Demo Corp", exchange: "NASDAQ" }]

// ─── Mock index data (SPY / QQQ / DIA / IWM) ─────────────────────────────────
const INDEX_SEEDS: Record<string, number> = { SPY: 99, QQQ: 77, DIA: 55, IWM: 33 }
const INDEX_CACHE: Record<string, PriceBar[]> = {}

function generateIndexBars(seed: number, startPrice: number): PriceBar[] {
  const rand = makeLCG(seed)
  const bars: PriceBar[] = []
  let price = startPrice
  const start = new Date("2020-01-02")
  const end   = new Date("2025-12-31")

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue
    const daily = (rand() - 0.49) * 0.018 + 0.0003
    const close = Math.round(price * (1 + daily) * 100) / 100
    bars.push({ date: d.toISOString().split("T")[0], open: price, high: Math.max(price, close) * (1 + rand() * 0.005), low: Math.min(price, close) * (1 - rand() * 0.005), close, volume: Math.floor(5_000_000 + rand() * 20_000_000) })
    price = close
  }
  return bars
}

function getIndexBars(ticker: string): PriceBar[] {
  if (!INDEX_CACHE[ticker]) {
    const seed = INDEX_SEEDS[ticker] ?? 11
    const startPrices: Record<string, number> = { SPY: 320, QQQ: 210, DIA: 290, IWM: 160 }
    INDEX_CACHE[ticker] = generateIndexBars(seed, startPrices[ticker] ?? 100)
  }
  return INDEX_CACHE[ticker]
}

const INDEX_TICKERS = new Set(["SPY", "QQQ", "DIA", "IWM"])

// ─── Mock DataProvider ────────────────────────────────────────────────────────
export const mockProvider: DataProvider = {
  async getProfile(ticker) {
    if (ticker === "DEMO") return PROFILE
    throw new Error(`Mock: unknown ticker ${ticker}`)
  },

  async getPrices(ticker, from, to) {
    const bars = INDEX_TICKERS.has(ticker) ? getIndexBars(ticker) : ALL_BARS
    return bars.filter((b) => b.date >= from && b.date <= to)
  },

  async getIncomeStatements() {
    return INCOME
  },

  async getBalanceSheets() {
    return BALANCE
  },

  async getCashFlowStatements() {
    return CASHFLOW
  },

  async getKeyMetrics() {
    return METRICS
  },

  async searchCompanies(query) {
    if (query.toUpperCase().includes("DEMO") || "finsight demo corp".includes(query.toLowerCase())) {
      return SEARCH_RESULT
    }
    return []
  },
}
