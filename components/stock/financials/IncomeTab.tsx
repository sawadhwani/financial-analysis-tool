import type { IncomeStatement } from "@/lib/data"
import { FinancialBarChart } from "./FinancialBarChart"
import { FinancialTable } from "./FinancialTable"

export function IncomeTab({ data }: { data: IncomeStatement[] }) {
  const sorted = [...data].reverse()
  const years = sorted.map((d) => String(d.fiscalYear))

  const chartData = sorted.map((d) => ({
    year: String(d.fiscalYear),
    Revenue: d.revenue,
    "Gross Profit": d.grossProfit,
    "Net Income": d.netIncome,
  }))

  const rows = [
    { label: "Revenue", values: sorted.map((d) => d.revenue), highlight: true },
    { label: "Gross Profit", values: sorted.map((d) => d.grossProfit) },
    { label: "Operating Income", values: sorted.map((d) => d.operatingIncome) },
    { label: "EBITDA", values: sorted.map((d) => d.ebitda) },
    { label: "Net Income", values: sorted.map((d) => d.netIncome), highlight: true },
    { label: "EPS (Diluted)", values: sorted.map((d) => d.epsDiluted) },
  ]

  return (
    <div>
      <FinancialBarChart
        data={chartData}
        xKey="year"
        series={[
          { key: "Revenue", label: "Revenue", color: "#3b82f6" },
          { key: "Gross Profit", label: "Gross Profit", color: "#22c55e" },
          { key: "Net Income", label: "Net Income", color: "#a855f7" },
        ]}
      />
      <FinancialTable years={years} rows={rows} />
    </div>
  )
}
