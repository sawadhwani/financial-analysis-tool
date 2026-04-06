"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import type { CompanyProfile, KeyMetrics } from "@/lib/data"
import { SaveCompButton } from "./SaveCompButton"

interface CompareRow {
  ticker: string
  name: string
  sector: string
  marketCap: number
  peRatio: number
  pbRatio: number
  evToEbitda: number
  grossMargin: number
  netMargin: number
  roe: number
}

interface Props {
  ticker: string
  profile: CompanyProfile
  metrics: KeyMetrics
}

function fmtCap(v: number) {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  return `$${(v / 1e6).toFixed(1)}M`
}

function fmtPct(v: number) {
  return v ? `${(v * 100).toFixed(1)}%` : "—"
}

function fmtRatio(v: number) {
  return v ? v.toFixed(1) : "—"
}

const METRICS: { label: string; fmt: (r: CompareRow) => string }[] = [
  { label: "Market Cap", fmt: (r) => fmtCap(r.marketCap) },
  { label: "P/E", fmt: (r) => fmtRatio(r.peRatio) },
  { label: "P/B", fmt: (r) => fmtRatio(r.pbRatio) },
  { label: "EV/EBITDA", fmt: (r) => fmtRatio(r.evToEbitda) },
  { label: "Gross Margin", fmt: (r) => fmtPct(r.grossMargin) },
  { label: "Net Margin", fmt: (r) => fmtPct(r.netMargin) },
  { label: "ROE", fmt: (r) => fmtPct(r.roe) },
]

export function ComparePeers({ ticker, profile, metrics }: Props) {
  const baseRow: CompareRow = {
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

  const [peers, setPeers] = useState<CompareRow[]>([])
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ ticker: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSuggestions(data.filter((d: any) => d.ticker !== ticker).slice(0, 6))
    }, 300)
  }, [query, ticker])

  async function addPeer(t: string) {
    const already = peers.find((p) => p.ticker === t)
    if (already || peers.length >= 5) return
    setSuggestions([])
    setQuery("")
    setLoading(true)
    try {
      const res = await fetch(`/api/compare?tickers=${t}`)
      const data = await res.json()
      if (Array.isArray(data) && data[0]) {
        setPeers((prev) => [...prev, data[0]])
      }
    } finally {
      setLoading(false)
    }
  }

  function removePeer(t: string) {
    setPeers((prev) => prev.filter((p) => p.ticker !== t))
  }

  const allRows = [baseRow, ...peers]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-600">Compare</h2>
          <SaveCompButton tickers={allRows.map((r) => r.ticker)} />
        </div>
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={peers.length >= 5 ? "Max 5 peers" : "Add ticker to compare..."}
            disabled={peers.length >= 5}
            className="w-56 rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 disabled:opacity-40"
          />
          {loading && (
            <span className="absolute right-3 top-1.5 text-gray-400 text-xs">...</span>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <li
                  key={s.ticker}
                  onClick={() => addPeer(s.ticker)}
                  className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-gray-50 text-xs"
                >
                  <span className="font-medium text-gray-900">{s.ticker}</span>
                  <span className="text-gray-400 truncate ml-2 max-w-[60%] text-right">{s.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left text-gray-400 font-medium w-32">Metric</th>
              {allRows.map((r, i) => (
                <th key={r.ticker} className="pb-2 px-3 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <Link
                      href={`/stock/${r.ticker}`}
                      className={`font-semibold hover:underline ${i === 0 ? "text-blue-600" : "text-gray-900"}`}
                    >
                      {r.ticker}
                    </Link>
                    <span className="text-gray-400 font-normal truncate max-w-[80px]">{r.name.split(" ")[0]}</span>
                    {i !== 0 && (
                      <button
                        onClick={() => removePeer(r.ticker)}
                        className="text-gray-300 hover:text-red-500 text-[10px] leading-none transition-colors"
                      >
                        remove
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.label} className="border-b border-gray-100 last:border-0">
                <td className="py-2 text-gray-400 pr-4">{m.label}</td>
                {allRows.map((r, i) => (
                  <td
                    key={r.ticker}
                    className={`py-2 px-3 text-right tabular-nums ${i === 0 ? "text-blue-600 font-medium" : "text-gray-600"}`}
                  >
                    {m.fmt(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
