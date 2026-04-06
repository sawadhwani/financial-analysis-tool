import { NextRequest, NextResponse } from "next/server"
import { dataProvider } from "@/lib/data"

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("tickers") ?? ""
  const tickers = raw.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean).slice(0, 6)
  if (tickers.length === 0) return NextResponse.json([])

  try {
    const results = await Promise.all(
      tickers.map(async (ticker) => {
        const [profile, metrics] = await Promise.all([
          dataProvider.getProfile(ticker),
          dataProvider.getKeyMetrics(ticker),
        ])
        return {
          ticker,
          name: profile.name,
          sector: profile.sector,
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
    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: "Failed to fetch comparison data" }, { status: 500 })
  }
}
