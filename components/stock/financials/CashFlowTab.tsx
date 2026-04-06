import type { CashFlowStatement } from "@/lib/data"
import { FinancialBarChart } from "./FinancialBarChart"
import { FinancialTable } from "./FinancialTable"

export function CashFlowTab({ data }: { data: CashFlowStatement[] }) {
  const sorted = [...data].reverse()
  const years = sorted.map((d) => String(d.fiscalYear))

  const chartData = sorted.map((d) => ({
    year: String(d.fiscalYear),
    "Operating CF": d.operatingCashFlow,
    "Free CF": d.freeCashFlow,
    CapEx: d.capitalExpenditures,
  }))

  const rows = [
    { label: "Operating Cash Flow", values: sorted.map((d) => d.operatingCashFlow), highlight: true },
    { label: "Capital Expenditures", values: sorted.map((d) => d.capitalExpenditures) },
    { label: "Free Cash Flow", values: sorted.map((d) => d.freeCashFlow), highlight: true },
    { label: "Dividends Paid", values: sorted.map((d) => d.dividendsPaid) },
  ]

  return (
    <div>
      <FinancialBarChart
        data={chartData}
        xKey="year"
        series={[
          { key: "Operating CF", label: "Operating CF", color: "#3b82f6" },
          { key: "Free CF", label: "Free CF", color: "#22c55e" },
          { key: "CapEx", label: "CapEx", color: "#f59e0b" },
        ]}
      />
      <FinancialTable years={years} rows={rows} />
    </div>
  )
}
