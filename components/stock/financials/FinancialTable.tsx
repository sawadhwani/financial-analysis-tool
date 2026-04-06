interface Row {
  label: string
  values: (string | number)[]
  highlight?: boolean
}

interface Props {
  years: string[]
  rows: Row[]
}

function fmt(v: string | number) {
  if (typeof v === "string") return v
  if (v === 0) return "—"
  const abs = Math.abs(v)
  const sign = v < 0 ? "-" : ""
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  return `${sign}$${abs.toLocaleString()}`
}

export function FinancialTable({ years, rows }: Props) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-2 text-left text-gray-400 font-medium w-40">Metric</th>
            {years.map((y) => (
              <th key={y} className="pb-2 text-right text-gray-400 font-medium px-3">{y}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={`border-b border-gray-100 last:border-0 ${row.highlight ? "bg-gray-50" : ""}`}
            >
              <td className={`py-2 text-left pr-4 ${row.highlight ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                {row.label}
              </td>
              {row.values.map((v, i) => (
                <td
                  key={i}
                  className={`py-2 text-right px-3 tabular-nums ${row.highlight ? "text-gray-900 font-medium" : "text-gray-600"}`}
                >
                  {fmt(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
