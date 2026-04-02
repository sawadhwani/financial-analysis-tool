import type {
  DataProvider,
  CompanyProfile,
  PriceBar,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyMetrics,
} from "./types"

const BASE = "https://financialmodelingprep.com/api/v3"

async function fmpGet<T>(path: string): Promise<T> {
  const key = process.env.FMP_API_KEY
  if (!key) throw new Error("FMP_API_KEY is not set")

  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}apikey=${key}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`FMP error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export const fmpProvider: DataProvider = {
  async getProfile(ticker) {
    const data = await fmpGet<any[]>(`/profile/${ticker}`)
    const d = data[0]
    return {
      ticker: d.symbol,
      name: d.companyName,
      exchange: d.exchangeShortName,
      sector: d.sector,
      industry: d.industry,
      description: d.description,
      marketCap: d.mktCap,
      employees: d.fullTimeEmployees,
      website: d.website,
      ceo: d.ceo,
      country: d.country,
    } satisfies CompanyProfile
  },

  async getPrices(ticker, from, to) {
    const data = await fmpGet<any[]>(`/historical-price-full/${ticker}?from=${from}&to=${to}`)
    const historical = (data as any).historical ?? []
    return historical.map((d: any): PriceBar => ({
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }))
  },

  async getIncomeStatements(ticker, period, limit) {
    const endpoint = period === "quarterly" ? "income-statement" : "income-statement"
    const p = period === "quarterly" ? "quarter" : "annual"
    const data = await fmpGet<any[]>(`/${endpoint}/${ticker}?period=${p}&limit=${limit}`)
    return data.map((d): IncomeStatement => ({
      fiscalYear: new Date(d.date).getFullYear(),
      fiscalQuarter: d.period?.startsWith("Q") ? parseInt(d.period[1]) : undefined,
      period,
      revenue: d.revenue,
      grossProfit: d.grossProfit,
      operatingIncome: d.operatingIncome,
      netIncome: d.netIncome,
      ebitda: d.ebitda,
      eps: d.eps,
      epsDiluted: d.epsdiluted,
      shares: d.weightedAverageShsOut,
    }))
  },

  async getBalanceSheets(ticker, period, limit) {
    const p = period === "quarterly" ? "quarter" : "annual"
    const data = await fmpGet<any[]>(`/balance-sheet-statement/${ticker}?period=${p}&limit=${limit}`)
    return data.map((d): BalanceSheet => ({
      fiscalYear: new Date(d.date).getFullYear(),
      fiscalQuarter: d.period?.startsWith("Q") ? parseInt(d.period[1]) : undefined,
      period,
      totalAssets: d.totalAssets,
      totalLiabilities: d.totalLiabilities,
      totalEquity: d.totalStockholdersEquity,
      cash: d.cashAndCashEquivalents,
      totalDebt: d.totalDebt,
      netDebt: d.netDebt,
    }))
  },

  async getCashFlowStatements(ticker, period, limit) {
    const p = period === "quarterly" ? "quarter" : "annual"
    const data = await fmpGet<any[]>(`/cash-flow-statement/${ticker}?period=${p}&limit=${limit}`)
    return data.map((d): CashFlowStatement => ({
      fiscalYear: new Date(d.date).getFullYear(),
      fiscalQuarter: d.period?.startsWith("Q") ? parseInt(d.period[1]) : undefined,
      period,
      operatingCashFlow: d.operatingCashFlow,
      capitalExpenditures: d.capitalExpenditure,
      freeCashFlow: d.freeCashFlow,
      dividendsPaid: d.dividendsPaid,
    }))
  },

  async getKeyMetrics(ticker) {
    const data = await fmpGet<any[]>(`/key-metrics-ttm/${ticker}`)
    const d = data[0]
    return {
      ticker,
      peRatio: d.peRatioTTM,
      pbRatio: d.pbRatioTTM,
      evToEbitda: d.enterpriseValueOverEBITDATTM,
      debtToEquity: d.debtToEquityTTM,
      returnOnEquity: d.roeTTM,
      returnOnAssets: d.roaTTM,
      currentRatio: d.currentRatioTTM,
      grossMargin: d.grossProfitMarginTTM,
      operatingMargin: d.operatingProfitMarginTTM,
      netMargin: d.netProfitMarginTTM,
    } satisfies KeyMetrics
  },

  async searchCompanies(query) {
    const data = await fmpGet<any[]>(`/search?query=${encodeURIComponent(query)}&limit=10&exchange=NASDAQ,NYSE`)
    return data.map((d) => ({
      ticker: d.symbol,
      name: d.name,
      exchange: d.stockExchange,
    }))
  },
}
