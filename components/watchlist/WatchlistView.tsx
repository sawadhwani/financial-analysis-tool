"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Stock {
  ticker: string
  name: string
  sector: string
  marketCap: number
  peRatio: number
  netMargin: number
  roe: number
}

interface SavedComp {
  id: string
  name: string
  tickers: string[]
  updatedAt: Date | string
}

interface Props {
  stocks: Stock[]
  savedComps: SavedComp[]
  userEmail: string
}

function fmtCap(v: number) {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  return `$${(v / 1e6).toFixed(1)}M`
}

function fmtPct(v: number) { return v ? `${(v * 100).toFixed(1)}%` : "—" }
function fmtRatio(v: number) { return v ? v.toFixed(1) : "—" }

export function WatchlistView({ stocks, savedComps: initialComps, userEmail }: Props) {
  const [comps, setComps] = useState(initialComps)
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  async function deleteComp(id: string) {
    await fetch("/api/comps", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setComps((prev) => prev.filter((c) => c.id !== id))
  }

  async function removeFromWatchlist(ticker: string) {
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
          <p className="mt-0.5 text-sm text-gray-400">{userEmail}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors">
            ← Home
          </Link>
          <button onClick={signOut} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      {/* Watchlist table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-600">Tracked Stocks</h2>
        </div>
        {stocks.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No stocks yet. Add them from any stock page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="pb-2 pt-3 px-4 text-left text-gray-400 font-medium">Ticker</th>
                  <th className="pb-2 pt-3 px-3 text-left text-gray-400 font-medium">Name</th>
                  <th className="pb-2 pt-3 px-3 text-left text-gray-400 font-medium">Sector</th>
                  <th className="pb-2 pt-3 px-3 text-right text-gray-400 font-medium">Mkt Cap</th>
                  <th className="pb-2 pt-3 px-3 text-right text-gray-400 font-medium">P/E</th>
                  <th className="pb-2 pt-3 px-3 text-right text-gray-400 font-medium">Net Margin</th>
                  <th className="pb-2 pt-3 px-3 text-right text-gray-400 font-medium">ROE</th>
                  <th className="pb-2 pt-3 px-4 text-right text-gray-400 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.ticker} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-4">
                      <Link href={`/stock/${s.ticker}`} className="font-semibold text-blue-600 hover:underline">{s.ticker}</Link>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 max-w-[160px] truncate">{s.name}</td>
                    <td className="py-2.5 px-3 text-gray-400">{s.sector}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtCap(s.marketCap)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtRatio(s.peRatio)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtPct(s.netMargin)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtPct(s.roe)}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button onClick={() => removeFromWatchlist(s.ticker)} className="text-gray-300 hover:text-red-500 transition-colors text-[11px]">remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saved Comps */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-600">Saved Comps</h2>
        </div>
        {comps.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No saved comps yet. Build a comparison on any stock page and save it.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {comps.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{c.name}</p>
                  <div className="mt-1 flex gap-1.5 flex-wrap">
                    {c.tickers.map((t) => (
                      <Link key={t} href={`/stock/${t}`} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-blue-600 hover:underline">
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
                <button onClick={() => deleteComp(c.id)} className="text-gray-300 hover:text-red-500 transition-colors text-xs ml-4 flex-shrink-0">
                  delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
