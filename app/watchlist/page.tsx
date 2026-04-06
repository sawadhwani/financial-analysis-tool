import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { dataProvider } from "@/lib/data"
import { redirect } from "next/navigation"
import { WatchlistView } from "@/components/watchlist/WatchlistView"

export const metadata = { title: "Watchlist — FinSight" }

export default async function WatchlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  const [watchlistItems, savedComps] = await Promise.all([
    prisma.watchlistItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.savedComp.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
  ])

  const tickers = watchlistItems.map((i) => i.ticker)

  const stockData = tickers.length > 0
    ? await Promise.allSettled(
        tickers.map(async (ticker) => {
          const [profile, metrics] = await Promise.all([
            dataProvider.getProfile(ticker),
            dataProvider.getKeyMetrics(ticker),
          ])
          return { ticker, name: profile.name, sector: profile.sector, marketCap: profile.marketCap, peRatio: metrics.peRatio, netMargin: metrics.netMargin, roe: metrics.returnOnEquity }
        })
      ).then((results) =>
        results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
          .map((r) => r.value)
      )
    : []

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <WatchlistView
          stocks={stockData}
          savedComps={savedComps}
          userEmail={user.email ?? ""}
        />
      </div>
    </main>
  )
}
