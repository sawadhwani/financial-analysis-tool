import { dataProvider } from "@/lib/data"
import { PriceDeepDive } from "@/components/stock/price/PriceDeepDive"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ ticker: string }>
}

export async function generateMetadata({ params }: Props) {
  const { ticker } = await params
  return { title: `${ticker.toUpperCase()} Price — FinSight` }
}

function toDateString(d: Date) {
  return d.toISOString().split("T")[0]
}

const INDICES = [
  { key: "SPY", label: "S&P 500" },
  { key: "QQQ", label: "NASDAQ 100" },
  { key: "DIA", label: "Dow Jones" },
  { key: "IWM", label: "Russell 2000" },
]

export default async function PricePage({ params }: Props) {
  const { ticker } = await params
  const sym = ticker.toUpperCase()

  const to = toDateString(new Date())
  const fromDate = new Date()
  fromDate.setFullYear(fromDate.getFullYear() - 5)
  const from = toDateString(fromDate)

  try {
    const [tickerResult, ...indexResults] = await Promise.allSettled([
      dataProvider.getPrices(sym, from, to),
      ...INDICES.map((i) => dataProvider.getPrices(i.key, from, to)),
    ])

    if (tickerResult.status === "rejected") throw tickerResult.reason

    const tickerPrices = tickerResult.value
    const hasOHLCV = tickerPrices.length > 0 && tickerPrices[0].open !== tickerPrices[0].close

    const indices = INDICES.map((idx, i) => ({
      key: idx.key,
      label: idx.label,
      prices: indexResults[i].status === "fulfilled" ? indexResults[i].value : [],
    }))

    return (
      <div className="px-6 py-8">
        <PriceDeepDive
          ticker={sym}
          prices={tickerPrices}
          indices={indices}
          hasOHLCV={hasOHLCV}
        />
      </div>
    )
  } catch (err: any) {
    if (!err?.message?.includes("FMP_RATE_LIMIT")) notFound()
    return (
      <div className="px-6 py-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-900 font-medium">Data temporarily unavailable</p>
          <p className="mt-1 text-sm text-gray-400">FMP API daily limit reached — resets at midnight UTC.</p>
        </div>
      </div>
    )
  }
}
