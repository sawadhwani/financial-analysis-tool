import { SearchBar } from "@/components/stock/SearchBar"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">FinSight</h1>
        <p className="mt-2 text-gray-400 text-sm">Company financials, prices, and key metrics</p>
      </div>
      <SearchBar />
      <div className="mt-6 flex gap-6">
        <Link href="/screener" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          Stock Screener →
        </Link>
        <Link href="/watchlist" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          My Watchlist →
        </Link>
      </div>
    </main>
  )
}
