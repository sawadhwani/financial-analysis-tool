import { dataProvider } from "@/lib/data"
import { ScreenerClient } from "@/components/screener/ScreenerClient"

export const metadata = { title: "Screener — FinSight" }

const TICKERS = [
  // Tech
  "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "AVGO", "ORCL", "CRM", "ADBE", "INTC", "AMD", "QCOM",
  // Finance
  "JPM", "BAC", "WFC", "GS", "MS", "V", "MA", "AXP",
  // Healthcare
  "JNJ", "UNH", "LLY", "PFE", "MRK", "ABBV", "TMO", "ABT",
  // Consumer
  "TSLA", "HD", "WMT", "COST", "TGT", "NKE", "MCD", "SBUX", "PG", "KO", "PEP",
  // Energy
  "XOM", "CVX", "COP", "SLB",
  // Industrial
  "CAT", "DE", "HON", "BA", "GE", "RTX", "UPS",
]

export default async function ScreenerPage() {
  const results = await Promise.allSettled(
    TICKERS.map(async (ticker) => {
      const [profile, metrics] = await Promise.all([
        dataProvider.getProfile(ticker),
        dataProvider.getKeyMetrics(ticker),
      ])
      return {
        ticker,
        name: profile.name,
        sector: profile.sector,
        industry: profile.industry,
        marketCap: profile.marketCap,
        peRatio: metrics.peRatio,
        pbRatio: metrics.pbRatio,
        evToEbitda: metrics.evToEbitda,
        grossMargin: metrics.grossMargin,
        netMargin: metrics.netMargin,
        roe: metrics.returnOnEquity,
      }
    })
  )

  const stocks = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
    .map((r) => r.value)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Stock Screener</h1>
          <p className="mt-1 text-sm text-gray-400">Large-cap US equities — filter and sort by key metrics</p>
        </div>
        <ScreenerClient stocks={stocks} />
      </div>
    </main>
  )
}
