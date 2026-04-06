"use client"

import { useState } from "react"
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from "@/lib/data"
import { IncomeTab } from "./IncomeTab"
import { BalanceTab } from "./BalanceTab"
import { CashFlowTab } from "./CashFlowTab"

type Tab = "income" | "balance" | "cashflow"

interface Props {
  income: IncomeStatement[]
  balance: BalanceSheet[]
  cashflow: CashFlowStatement[]
}

const TABS: { id: Tab; label: string }[] = [
  { id: "income", label: "Income Statement" },
  { id: "balance", label: "Balance Sheet" },
  { id: "cashflow", label: "Cash Flow" },
]

export function FinancialsSection({ income, balance, cashflow }: Props) {
  const [active, setActive] = useState<Tab>("income")

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-600">Financials (Annual, 5-Year)</h2>
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              active === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "income" && <IncomeTab data={income} />}
      {active === "balance" && <BalanceTab data={balance} />}
      {active === "cashflow" && <CashFlowTab data={cashflow} />}
    </div>
  )
}
