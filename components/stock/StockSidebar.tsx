"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, TrendingUp, BarChart2, LineChart, Users, ArrowLeft } from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  available: boolean
}

interface Props {
  ticker: string
}

export function StockSidebar({ ticker }: Props) {
  const pathname = usePathname()

  const nav: NavItem[] = [
    {
      label: "Overview",
      href: `/stock/${ticker}`,
      icon: <LayoutDashboard size={15} />,
      available: true,
    },
    {
      label: "Share Price",
      href: `/stock/${ticker}/price`,
      icon: <TrendingUp size={15} />,
      available: true,
    },
    {
      label: "Financials",
      href: `/stock/${ticker}/financials`,
      icon: <BarChart2 size={15} />,
      available: false,
    },
    {
      label: "Key Metrics",
      href: `/stock/${ticker}/metrics`,
      icon: <LineChart size={15} />,
      available: false,
    },
    {
      label: "Comps",
      href: `/stock/${ticker}/comps`,
      icon: <Users size={15} />,
      available: false,
    },
  ]

  function isActive(href: string) {
    if (href === `/stock/${ticker}`) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-52 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-3">
          <ArrowLeft size={12} />
          Back
        </Link>
        <p className="text-lg font-bold text-gray-900">{ticker}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map((item) => {
          const active = isActive(item.href)
          if (!item.available) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-gray-300 cursor-not-allowed"
              >
                {item.icon}
                {item.label}
              </div>
            )
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors ${
                active
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
