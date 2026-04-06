"use client"

import { useState } from "react"

export function SaveCompButton({ tickers }: { tickers: string[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (!name.trim() || tickers.length < 2) return
    setSaving(true)
    try {
      const res = await fetch("/api/comps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), tickers }),
      })
      if (res.ok) {
        setSaved(true)
        setOpen(false)
        setName("")
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (tickers.length < 2) return null

  return (
    <div className="relative">
      {saved && <span className="text-xs text-green-600 mr-2">Saved!</span>}
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        Save Comp
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-10 flex gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="Name this comp..."
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 w-44"
          />
          <button
            onClick={save}
            disabled={saving || !name.trim()}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      )}
    </div>
  )
}
