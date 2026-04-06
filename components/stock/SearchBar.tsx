"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface Result {
  ticker: string
  name: string
  exchange: string
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
        setOpen(data.length > 0)
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function select(ticker: string) {
    setOpen(false)
    setQuery("")
    router.push(`/stock/${ticker}`)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ticker or company name..."
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && results.length > 0) select(results[0].ticker)
        }}
      />
      {loading && (
        <div className="absolute right-4 top-3.5 text-gray-400 text-xs">...</div>
      )}
      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {results.map((r) => (
            <li
              key={r.ticker}
              onClick={() => select(r.ticker)}
              className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm">{r.ticker}</span>
              <span className="text-gray-400 text-xs truncate ml-4 max-w-[60%] text-right">{r.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
