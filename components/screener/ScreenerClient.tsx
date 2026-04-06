"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

interface StockRow {
  ticker: string
  name: string
  sector: string
  industry: string
  marketCap: number
  peRatio: number
  pbRatio: number
  evToEbitda: number
  grossMargin: number
  netMargin: number
  roe: number
}

type SortKey = "marketCap" | "peRatio" | "pbRatio" | "evToEbitda" | "grossMargin" | "netMargin" | "roe"

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

const SECTORS = ["All Sectors", "Technology", "Financials", "Healthcare", "Consumer Discretionary", "Consumer Staples", "Energy", "Industrials"]

export function ScreenerClient({ stocks }: { stocks: StockRow[] }) {
  const [sector, setSector] = useState("All Sectors")
  const [marketCapFilter, setMarketCapFilter] = useState("all")
  const [peFilter, setPeFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("marketCap")
  const [sortAsc, setSortAsc] = useState(false)

  const filtered = useMemo(() => {
    let rows = [...stocks]

    if (sector !== "All Sectors") {
      rows = rows.filter((r) => r.sector === sector)
    }

    if (marketCapFilter === "100b") rows = rows.filter((r) => r.marketCap >= 100e9)
    else if (marketCapFilter === "10b") rows = rows.filter((r) => r.marketCap >= 10e9)

    if (peFilter === "under15") rows = rows.filter((r) => r.peRatio > 0 && r.peRatio < 15)
    else if (peFilter === "15to30") rows = rows.filter((r) => r.peRatio >= 15 && r.peRatio <= 30)
    else if (peFilter === "over30") rows = rows.filter((r) => r.peRatio > 30)

    rows.sort((a, b) => {
      const av = a[sortKey] ?? 0
      const bv = b[sortKey] ?? 0
      return sortAsc ? av - bv : bv - av
    })

    return rows
  }, [stocks, sector, marketCapFilter, peFilter, sortKey, sortAsc])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  function SortHeader({ label, col }: { label: string; col: SortKey }) {
    const active = sortKey === col
    return (
      <th
        className="pb-2 px-3 text-right text-gray-400 font-medium cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
        onClick={() => toggleSort(col)}
      >
        {label} {active ? (sortAsc ? "↑" : "↓") : ""}
      </th>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-gray-400"
        >
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select
          value={marketCapFilter}
          onChange={(e) => setMarketCapFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-gray-400"
        >
          <option value="all">All Market Caps</option>
          <option value="10b">{">"} $10B</option>
          <option value="100b">{">"} $100B</option>
        </select>

        <select
          value={peFilter}
          onChange={(e) => setPeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-gray-400"
        >
          <option value="all">All P/E</option>
          <option value="under15">P/E {"<"} 15</option>
          <option value="15to30">P/E 15–30</option>
          <option value="over30">P/E {">"} 30</option>
        </select>

        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} stocks</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="pb-3 pt-4 px-4 text-left text-gray-400 font-medium">Ticker</th>
                <th className="pb-3 pt-4 px-3 text-left text-gray-400 font-medium">Name</th>
                <th className="pb-3 pt-4 px-3 text-left text-gray-400 font-medium">Sector</th>
                <SortHeader label="Mkt Cap" col="marketCap" />
                <SortHeader label="P/E" col="peRatio" />
                <SortHeader label="P/B" col="pbRatio" />
                <SortHeader label="EV/EBITDA" col="evToEbitda" />
                <SortHeader label="Gross Margin" col="grossMargin" />
                <SortHeader label="Net Margin" col="netMargin" />
                <SortHeader label="ROE" col="roe" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.ticker} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-4">
                    <Link href={`/stock/${r.ticker}`} className="font-semibold text-blue-600 hover:underline">
                      {r.ticker}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-[160px] truncate">{r.name}</td>
                  <td className="py-2.5 px-3 text-gray-400">{r.sector}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtCap(r.marketCap)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtRatio(r.peRatio)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtRatio(r.pbRatio)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtRatio(r.evToEbitda)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtPct(r.grossMargin)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtPct(r.netMargin)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">{fmtPct(r.roe)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400">No stocks match the current filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
