"use client"

import { useState, useEffect } from "react"

export function WatchlistButton({ ticker }: { ticker: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((tickers: string[]) => {
        if (Array.isArray(tickers)) setSaved(tickers.includes(ticker))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ticker])

  async function toggle() {
    setLoading(true)
    try {
      await fetch("/api/watchlist", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      })
      setSaved((v) => !v)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="h-8 w-28 rounded-lg bg-gray-100 animate-pulse" />

  return (
    <button
      onClick={toggle}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
        saved
          ? "border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100"
          : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700"
      }`}
    >
      {saved ? "★ Watchlisted" : "☆ Add to Watchlist"}
    </button>
  )
}
