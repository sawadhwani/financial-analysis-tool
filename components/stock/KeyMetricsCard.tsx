import type { KeyMetrics } from "@/lib/data"

function pct(v: number) {
  if (v == null || isNaN(v)) return "—"
  return `${(v * 100).toFixed(2)}%`
}

function ratio(v: number, decimals = 2) {
  if (v == null || isNaN(v)) return "—"
  return v.toFixed(decimals) + "x"
}

function plain(v: number, decimals = 2) {
  if (v == null || isNaN(v)) return "—"
  return v.toFixed(decimals)
}

interface MetricRowProps {
  label: string
  value: string
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-900">{value}</span>
    </div>
  )
}

export function KeyMetricsCard({ metrics }: { metrics: KeyMetrics }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-600">Key Metrics (TTM)</h2>
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <MetricRow label="P/E Ratio" value={plain(metrics.peRatio)} />
          <MetricRow label="P/B Ratio" value={plain(metrics.pbRatio)} />
          <MetricRow label="EV / EBITDA" value={ratio(metrics.evToEbitda)} />
        </div>
        <div>
          <MetricRow label="Return on Equity" value={pct(metrics.returnOnEquity)} />
          <MetricRow label="Return on Assets" value={pct(metrics.returnOnAssets)} />
          <MetricRow label="Debt / Equity" value={plain(metrics.debtToEquity)} />
        </div>
        <div>
          <MetricRow label="Gross Margin" value={pct(metrics.grossMargin)} />
          <MetricRow label="Operating Margin" value={pct(metrics.operatingMargin)} />
          <MetricRow label="Net Margin" value={pct(metrics.netMargin)} />
        </div>
      </div>
    </div>
  )
}
