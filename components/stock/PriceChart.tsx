"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { PriceBar } from "@/lib/data"

interface Props {
  prices: PriceBar[]
  ticker: string
}

function fmt(v: number) {
  return `$${v.toFixed(2)}`
}

export function PriceChart({ prices, ticker }: Props) {
  const data = useMemo(() => [...prices].reverse(), [prices])

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-400 text-sm shadow-sm">
        No price data available
      </div>
    )
  }

  const first = data[0].close
  const last = data[data.length - 1].close
  const positive = last >= first
  const color = positive ? "#16a34a" : "#dc2626"

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-600">{ticker} — 1 Year Price</h2>
        <span className={`text-sm font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
          {positive ? "+" : ""}{(((last - first) / first) * 100).toFixed(2)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.slice(5)}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
            width={55}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#6b7280" }}
            formatter={(v) => [fmt(Number(v)), "Close"]}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
