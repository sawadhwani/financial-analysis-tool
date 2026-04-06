"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
} from "lightweight-charts"
import type { PriceBar } from "@/lib/data"

interface IndexData {
  key: string
  label: string
  prices: PriceBar[]
}

interface Props {
  ticker: string
  prices: PriceBar[]
  indices: IndexData[]
  hasOHLCV: boolean
}

type ChartType = "area" | "candle"
type Range = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y"

const RANGE_DAYS: Record<Range, number> = {
  "1M": 30, "3M": 90, "6M": 180, "1Y": 365, "3Y": 1095, "5Y": 1825,
}

const INDEX_COLORS = ["#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"]

function filterByRange(prices: PriceBar[], days: number): PriceBar[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split("T")[0]
  return prices.filter((p) => p.date >= cutoffStr)
}

function normalizeToPercent(prices: PriceBar[]): { time: string; value: number }[] {
  if (prices.length === 0) return []
  const base = prices[0].close
  return prices.map((p) => ({
    time: p.date,
    value: ((p.close - base) / base) * 100,
  }))
}

export function PriceDeepDive({ ticker, prices, indices, hasOHLCV }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const chartApi = useRef<IChartApi | null>(null)
  const volumeApi = useRef<IChartApi | null>(null)
  const mainSeries = useRef<ISeriesApi<SeriesType> | null>(null)
  const indexSeriesRefs = useRef<Map<string, ISeriesApi<SeriesType>>>(new Map())
  const volSeries = useRef<ISeriesApi<"Histogram"> | null>(null)

  const [chartType, setChartType] = useState<ChartType>("area")
  const [range, setRange] = useState<Range>("1Y")
  const [activeIndices, setActiveIndices] = useState<Set<string>>(new Set())
  const isComparing = activeIndices.size > 0

  const sorted = [...prices].reverse()
  const rangePrices = filterByRange(sorted, RANGE_DAYS[range])

  const buildCharts = useCallback(() => {
    if (!chartRef.current || !volumeRef.current) return

    // Destroy existing
    chartApi.current?.remove()
    volumeApi.current?.remove()
    indexSeriesRefs.current.clear()

    const chartOptions = {
      layout: {
        background: { color: "#ffffff" },
        textColor: "#6b7280",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#f3f4f6" },
        horzLines: { color: "#f3f4f6" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#e5e7eb" },
      timeScale: { borderColor: "#e5e7eb", timeVisible: true },
      handleScroll: true,
      handleScale: true,
    }

    // Main chart
    const chart = createChart(chartRef.current, { ...chartOptions, height: 380 })
    chartApi.current = chart

    if (isComparing) {
      // Normalized % comparison — ticker as area
      const tickerNorm = normalizeToPercent(rangePrices)
      const areaSer = chart.addSeries(AreaSeries, {
        lineColor: "#2563eb",
        topColor: "#2563eb18",
        bottomColor: "#2563eb00",
        lineWidth: 2,
        title: ticker,
        priceFormat: { type: "custom", formatter: (v: number) => `${v.toFixed(1)}%` },
      })
      areaSer.setData(tickerNorm as any)
      mainSeries.current = areaSer

      // Index overlays
      indices.forEach((idx, i) => {
        if (!activeIndices.has(idx.key)) return
        const idxPrices = filterByRange([...idx.prices].reverse(), RANGE_DAYS[range])
        const norm = normalizeToPercent(idxPrices)
        const lineSer = chart.addSeries(LineSeries, {
          color: INDEX_COLORS[i % INDEX_COLORS.length],
          lineWidth: 2,
          title: idx.label,
          priceFormat: { type: "custom", formatter: (v: number) => `${v.toFixed(1)}%` },
        })
        lineSer.setData(norm as any)
        indexSeriesRefs.current.set(idx.key, lineSer)
      })
    } else if (chartType === "candle" && hasOHLCV) {
      const candleSer = chart.addSeries(CandlestickSeries, {
        upColor: "#16a34a",
        downColor: "#dc2626",
        borderUpColor: "#16a34a",
        borderDownColor: "#dc2626",
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
      })
      candleSer.setData(
        rangePrices.map((p) => ({
          time: p.date,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
        })) as any
      )
      mainSeries.current = candleSer
    } else {
      const areaSer = chart.addSeries(AreaSeries, {
        lineColor: "#2563eb",
        topColor: "#2563eb18",
        bottomColor: "#2563eb00",
        lineWidth: 2,
      })
      areaSer.setData(rangePrices.map((p) => ({ time: p.date, value: p.close })) as any)
      mainSeries.current = areaSer
    }

    chart.timeScale().fitContent()

    // Volume chart
    const volChart = createChart(volumeRef.current, {
      ...chartOptions,
      height: 90,
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false },
    })
    volumeApi.current = volChart

    const volSer = volChart.addSeries(HistogramSeries, {
      color: "#d1d5db",
      priceFormat: { type: "volume" },
    })
    volSer.setData(
      rangePrices.map((p) => ({
        time: p.date,
        value: p.volume,
        color: p.close >= p.open ? "#bbf7d0" : "#fecaca",
      })) as any
    )
    volSeries.current = volSer
    volChart.timeScale().fitContent()

    // Sync crosshair between charts
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) volChart.timeScale().setVisibleLogicalRange(range)
    })
    volChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) chart.timeScale().setVisibleLogicalRange(range)
    })

    // Responsive resize
    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: chartRef.current!.clientWidth })
      volChart.applyOptions({ width: volumeRef.current!.clientWidth })
    })
    ro.observe(chartRef.current!)
    ro.observe(volumeRef.current!)
    return () => ro.disconnect()
  }, [chartType, range, isComparing, rangePrices, indices, activeIndices, hasOHLCV, ticker])

  useEffect(() => {
    const cleanup = buildCharts()
    return () => {
      cleanup?.()
      chartApi.current?.remove()
      volumeApi.current?.remove()
      chartApi.current = null
      volumeApi.current = null
    }
  }, [buildCharts])

  function toggleIndex(key: string) {
    setActiveIndices((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">{ticker} — Share Price</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Range */}
          <div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5">
            {(["1M", "3M", "6M", "1Y", "3Y", "5Y"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Chart type */}
          <div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5">
            <button
              onClick={() => setChartType("area")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                chartType === "area" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("candle")}
              disabled={!hasOHLCV}
              title={!hasOHLCV ? "OHLCV data unavailable on current FMP plan" : undefined}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                chartType === "candle" && hasOHLCV
                  ? "bg-white text-gray-900 shadow-sm"
                  : hasOHLCV
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              Candle
            </button>
          </div>

          {/* Index overlays */}
          <div className="flex gap-1.5 flex-wrap">
            {indices.map((idx, i) => {
              const active = activeIndices.has(idx.key)
              return (
                <button
                  key={idx.key}
                  onClick={() => toggleIndex(idx.key)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                    active
                      ? "text-white border-transparent"
                      : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                  style={active ? { backgroundColor: INDEX_COLORS[i % INDEX_COLORS.length], borderColor: INDEX_COLORS[i % INDEX_COLORS.length] } : {}}
                >
                  {idx.label}
                </button>
              )
            })}
          </div>

          {isComparing && (
            <span className="text-xs text-gray-400">Showing % return from period start</span>
          )}
        </div>

        {/* Main chart */}
        <div ref={chartRef} className="w-full" />

        {/* Volume label */}
        <div className="mt-1 mb-0.5 text-[10px] text-gray-400 px-1">Volume</div>

        {/* Volume chart */}
        <div ref={volumeRef} className="w-full" />
      </div>
    </div>
  )
}
