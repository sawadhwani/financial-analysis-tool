export interface CompanyProfile {
  ticker: string
  name: string
  exchange: string
  sector: string
  industry: string
  description: string
  marketCap: number
  employees: number
  website: string
  ceo: string
  country: string
}

export interface PriceBar {
  date: string // ISO date string "YYYY-MM-DD"
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface IncomeStatement {
  fiscalYear: number
  fiscalQuarter?: number
  period: "annual" | "quarterly"
  revenue: number
  grossProfit: number
  operatingIncome: number
  netIncome: number
  ebitda: number
  eps: number
  epsDiluted: number
  shares: number
}

export interface BalanceSheet {
  fiscalYear: number
  fiscalQuarter?: number
  period: "annual" | "quarterly"
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  cash: number
  totalDebt: number
  netDebt: number
}

export interface CashFlowStatement {
  fiscalYear: number
  fiscalQuarter?: number
  period: "annual" | "quarterly"
  operatingCashFlow: number
  capitalExpenditures: number
  freeCashFlow: number
  dividendsPaid: number
}

export interface KeyMetrics {
  ticker: string
  peRatio: number
  pbRatio: number
  evToEbitda: number
  debtToEquity: number
  returnOnEquity: number
  returnOnAssets: number
  currentRatio: number
  grossMargin: number
  operatingMargin: number
  netMargin: number
}

export interface DataProvider {
  getProfile(ticker: string): Promise<CompanyProfile>
  getPrices(ticker: string, from: string, to: string): Promise<PriceBar[]>
  getIncomeStatements(ticker: string, period: "annual" | "quarterly", limit: number): Promise<IncomeStatement[]>
  getBalanceSheets(ticker: string, period: "annual" | "quarterly", limit: number): Promise<BalanceSheet[]>
  getCashFlowStatements(ticker: string, period: "annual" | "quarterly", limit: number): Promise<CashFlowStatement[]>
  getKeyMetrics(ticker: string): Promise<KeyMetrics>
  searchCompanies(query: string): Promise<{ ticker: string; name: string; exchange: string }[]>
}
