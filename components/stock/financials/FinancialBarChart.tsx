"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface Series {
  key: string
  label: string
  color: string
}

interface Props {
  data: Record<string, number | string>[]
  series: Series[]
  xKey: string
}

function fmtBillions(v: number) {
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(1)}T`
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${v.toLocaleString()}`
}

export function FinancialBarChart({ data, series, xKey }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
        <XAxis dataKey={xKey} tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtBillions(v)}
          width={60}
        />
        <Tooltip
          contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
          formatter={(v, name) => [fmtBillions(Number(v)), String(name)]}
          labelStyle={{ color: "#6b7280" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "#6b7280", paddingTop: 8 }}
          iconType="square"
          iconSize={8}
        />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
