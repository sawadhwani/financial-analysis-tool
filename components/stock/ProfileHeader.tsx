import type { CompanyProfile } from "@/lib/data"
import Link from "next/link"
import { WatchlistButton } from "./WatchlistButton"

function fmt(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

export function ProfileHeader({ profile }: { profile: CompanyProfile }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{profile.ticker}</h1>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{profile.exchange}</span>
          </div>
          <p className="mt-1 text-gray-700 text-sm">{profile.name}</p>
          <p className="mt-0.5 text-gray-400 text-xs">{profile.sector} · {profile.industry}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-900">{fmt(profile.marketCap)}</p>
            <p className="text-xs text-gray-400">Market Cap</p>
          </div>
          <WatchlistButton ticker={profile.ticker} />
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 leading-relaxed line-clamp-3">{profile.description}</p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
        {profile.ceo && <span>CEO: <span className="text-gray-700">{profile.ceo}</span></span>}
        {profile.employees > 0 && <span>Employees: <span className="text-gray-700">{profile.employees.toLocaleString()}</span></span>}
        {profile.country && <span>Country: <span className="text-gray-700">{profile.country}</span></span>}
        {profile.website && (
          <Link href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {profile.website.replace(/^https?:\/\//, "")}
          </Link>
        )}
      </div>
    </div>
  )
}
