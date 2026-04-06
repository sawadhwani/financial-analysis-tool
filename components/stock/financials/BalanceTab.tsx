import type { BalanceSheet } from "@/lib/data"
import { FinancialBarChart } from "./FinancialBarChart"
import { FinancialTable } from "./FinancialTable"

export function BalanceTab({ data }: { data: BalanceSheet[] }) {
  const sorted = [...data].reverse()
  const years = sorted.map((d) => String(d.fiscalYear))

  const chartData = sorted.map((d) => ({
    year: String(d.fiscalYear),
    Assets: d.totalAssets,
    Liabilities: d.totalLiabilities,
    Equity: d.totalEquity,
  }))

  const rows = [
    { label: "Total Assets", values: sorted.map((d) => d.totalAssets), highlight: true },
    { label: "Cash & Equivalents", values: sorted.map((d) => d.cash) },
    { label: "Total Liabilities", values: sorted.map((d) => d.totalLiabilities), highlight: true },
    { label: "Total Debt", values: sorted.map((d) => d.totalDebt) },
    { label: "Net Debt", values: sorted.map((d) => d.netDebt) },
    { label: "Total Equity", values: sorted.map((d) => d.totalEquity), highlight: true },
  ]

  return (
    <div>
      <FinancialBarChart
        data={chartData}
        xKey="year"
        series={[
          { key: "Assets", label: "Total Assets", color: "#3b82f6" },
          { key: "Liabilities", label: "Total Liabilities", color: "#ef4444" },
          { key: "Equity", label: "Total Equity", color: "#22c55e" },
        ]}
      />
      <FinancialTable years={years} rows={rows} />
    </div>
  )
}
