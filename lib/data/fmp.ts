import type {
  DataProvider,
  CompanyProfile,
  PriceBar,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyMetrics,
} from "./types"

const BASE = "https://financialmodelingprep.com/stable"

async function fmpGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = process.env.FMP_API_KEY
  if (!key) throw new Error("FMP_API_KEY is not set")

  const qs = new URLSearchParams({ ...params, apikey: key }).toString()
  const url = `${BASE}${path}?${qs}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`FMP error ${res.status}: ${path}`)
  const data = await res.json()
  if (data && typeof data === "object" && !Array.isArray(data) && data["Error Message"]) {
    throw new Error(`FMP_RATE_LIMIT: ${data["Error Message"]}`)
  }
  return data as T
}

export const fmpProvider: DataProvider = {
  async getProfile(ticker) {
    const data = await fmpGet<any[]>("/profile", { symbol: ticker })
    const d = data[0]
    return {
      ticker: d.symbol,
      name: d.companyName,
      exchange: d.exchange,
      sector: d.sector ?? "",
      industry: d.industry ?? "",
      description: d.description ?? "",
      marketCap: d.marketCap ?? 0,
      employees: d.fullTimeEmployees ?? 0,
      website: d.website ?? "",
      ceo: d.ceo ?? "",
      country: d.country ?? "",
    } satisfies CompanyProfile
  },

  async getPrices(ticker, from, to) {
    // Try full OHLCV first, fall back to light (close only)
    try {
      const data = await fmpGet<any[]>("/historical-price-eod/full", { symbol: ticker, from, to })
      if (Array.isArray(data) && data.length > 0 && data[0].open != null) {
        return data.map((d: any): PriceBar => ({
          date: d.date,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume,
        }))
      }
    } catch {}

    const data = await fmpGet<any[]>("/historical-price-eod/light", { symbol: ticker, from, to })
    return data.map((d: any): PriceBar => ({
      date: d.date,
      open: d.price,
      high: d.price,
      low: d.price,
      close: d.price,
      volume: d.volume,
    }))
  },

  async getIncomeStatements(ticker, period, limit) {
    const data = await fmpGet<any[]>("/income-statement", {
      symbol: ticker,
      period: period === "quarterly" ? "quarter" : "annual",
      limit: String(limit),
    })
    return data.map((d): IncomeStatement => ({
      fiscalYear: new Date(d.date).getFullYear(),
      fiscalQuarter: d.period?.startsWith("Q") ? parseInt(d.period[1]) : undefined,
      period,
      revenue: d.revenue ?? 0,
      grossProfit: d.grossProfit ?? 0,
      operatingIncome: d.operatingIncome ?? 0,
      netIncome: d.netIncome ?? 0,
      ebitda: d.ebitda ?? 0,
      eps: d.eps ?? 0,
      epsDiluted: d.epsdiluted ?? 0,
      shares: d.weightedAverageShsOut ?? 0,
    }))
  },

  async getBalanceSheets(ticker, period, limit) {
    const data = await fmpGet<any[]>("/balance-sheet-statement", {
      symbol: ticker,
      period: period === "quarterly" ? "quarter" : "annual",
      limit: String(limit),
    })
    return data.map((d): BalanceSheet => ({
      fiscalYear: new Date(d.date).getFullYear(),
      fiscalQuarter: d.period?.startsWith("Q") ? parseInt(d.period[1]) : undefined,
      period,
      totalAssets: d.totalAssets ?? 0,
      totalLiabilities: d.totalLiabilities ?? 0,
      totalEquity: d.totalStockholdersEquity ?? 0,
      cash: d.cashAndCashEquivalents ?? 0,
      totalDebt: d.totalDebt ?? 0,
      netDebt: d.netDebt ?? 0,
    }))
  },

  async getCashFlowStatements(ticker, period, limit) {
    const data = await fmpGet<any[]>("/cash-flow-statement", {
      symbol: ticker,
      period: period === "quarterly" ? "quarter" : "annual",
      limit: String(limit),
    })
    return data.map((d): CashFlowStatement => ({
      fiscalYear: new Date(d.date).getFullYear(),
      fiscalQuarter: d.period?.startsWith("Q") ? parseInt(d.period[1]) : undefined,
      period,
      operatingCashFlow: d.operatingCashFlow ?? 0,
      capitalExpenditures: d.capitalExpenditure ?? 0,
      freeCashFlow: d.freeCashFlow ?? 0,
      dividendsPaid: d.dividendsPaid ?? 0,
    }))
  },

  async getKeyMetrics(ticker) {
    const [km, ratios] = await Promise.all([
      fmpGet<any[]>("/key-metrics-ttm", { symbol: ticker }),
      fmpGet<any[]>("/ratios-ttm", { symbol: ticker }),
    ])
    const k = km[0]
    const r = ratios[0]
    return {
      ticker,
      peRatio: r.priceToEarningsRatioTTM ?? 0,
      pbRatio: r.priceToBookRatioTTM ?? 0,
      evToEbitda: k.evToEBITDATTM ?? 0,
      debtToEquity: r.debtToEquityRatioTTM ?? 0,
      returnOnEquity: k.returnOnEquityTTM ?? 0,
      returnOnAssets: k.returnOnAssetsTTM ?? 0,
      currentRatio: r.currentRatioTTM ?? 0,
      grossMargin: r.grossProfitMarginTTM ?? 0,
      operatingMargin: r.operatingProfitMarginTTM ?? 0,
      netMargin: r.netProfitMarginTTM ?? 0,
    } satisfies KeyMetrics
  },

  async searchCompanies(query) {
    const data = await fmpGet<any[]>("/search-symbol", { query, limit: "10" })
    return data
      .filter((d) => d.exchange === "NASDAQ" || d.exchange === "NYSE")
      .map((d) => ({
        ticker: d.symbol,
        name: d.name,
        exchange: d.exchange,
      }))
  },
}
