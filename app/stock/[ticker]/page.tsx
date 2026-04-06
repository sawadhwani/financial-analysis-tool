import { dataProvider } from "@/lib/data"
import { ProfileHeader } from "@/components/stock/ProfileHeader"
import { PriceChart } from "@/components/stock/PriceChart"
import { KeyMetricsCard } from "@/components/stock/KeyMetricsCard"
import { FinancialsSection } from "@/components/stock/financials/FinancialsSection"
import { ComparePeers } from "@/components/stock/ComparePeers"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ ticker: string }>
}

export async function generateMetadata({ params }: Props) {
  const { ticker } = await params
  return { title: `${ticker.toUpperCase()} — FinSight` }
}

function toDateString(d: Date) {
  return d.toISOString().split("T")[0]
}

export default async function StockPage({ params }: Props) {
  const { ticker } = await params
  const sym = ticker.toUpperCase()

  const to = toDateString(new Date())
  const fromDate = new Date()
  fromDate.setFullYear(fromDate.getFullYear() - 1)
  const from = toDateString(fromDate)

  try {
    const [profile, prices, metrics, income, balance, cashflow] = await Promise.all([
      dataProvider.getProfile(sym),
      dataProvider.getPrices(sym, from, to),
      dataProvider.getKeyMetrics(sym),
      dataProvider.getIncomeStatements(sym, "annual", 5),
      dataProvider.getBalanceSheets(sym, "annual", 5),
      dataProvider.getCashFlowStatements(sym, "annual", 5),
    ])

    return (
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
          <ProfileHeader profile={profile} />
          <PriceChart prices={prices} ticker={sym} />
          <KeyMetricsCard metrics={metrics} />
          <FinancialsSection income={income} balance={balance} cashflow={cashflow} />
          <ComparePeers ticker={sym} profile={profile} metrics={metrics} />
      </div>
    )
  } catch (err: any) {
    if (!err?.message?.includes("FMP_RATE_LIMIT")) notFound()

    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-medium">Data temporarily unavailable</p>
          <p className="mt-1 text-sm text-gray-400">FMP API daily limit reached — resets at midnight UTC. Try again later or upgrade your FMP plan.</p>
        </div>
      </main>
    )
  }
}
