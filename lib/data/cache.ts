import { prisma } from "@/lib/prisma"
import { fmpProvider } from "./fmp"
import type {
  DataProvider,
  CompanyProfile,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyMetrics,
  PriceBar,
} from "./types"

const PROFILE_TTL_MS  = 24 * 60 * 60 * 1000  // 24 hours
const METRICS_TTL_MS  = 24 * 60 * 60 * 1000  // 24 hours
const STMT_TTL_MS     = 24 * 60 * 60 * 1000  // 24 hours
const PRICE_TTL_MS    = 15 * 60 * 1000        // 15 minutes

function isStale(fetchedAt: Date | null | undefined, ttl: number) {
  if (!fetchedAt) return true
  return Date.now() - fetchedAt.getTime() > ttl
}

async function getOrCreateCompany(ticker: string) {
  return prisma.company.upsert({
    where: { ticker },
    create: { ticker, name: ticker },
    update: {},
  })
}

export const cachedProvider: DataProvider = {
  // Search is not cached — it's a live query and not rate-limit-sensitive
  searchCompanies: fmpProvider.searchCompanies.bind(fmpProvider),

  async getProfile(ticker) {
    const company = await getOrCreateCompany(ticker)

    if (!isStale(company.profileFetchedAt, PROFILE_TTL_MS) && company.profileData) {
      return company.profileData as unknown as CompanyProfile
    }

    try {
      const profile = await fmpProvider.getProfile(ticker)
      await prisma.company.update({
        where: { ticker },
        data: {
          name: profile.name,
          exchange: profile.exchange,
          sector: profile.sector,
          industry: profile.industry,
          profileData: profile as any,
          profileFetchedAt: new Date(),
        },
      })
      return profile
    } catch (err) {
      if (company.profileData) return company.profileData as unknown as CompanyProfile
      throw err
    }
  },

  async getKeyMetrics(ticker) {
    const company = await getOrCreateCompany(ticker)

    if (!isStale(company.metricsFetchedAt, METRICS_TTL_MS) && company.metricsData) {
      return company.metricsData as unknown as KeyMetrics
    }

    try {
      const metrics = await fmpProvider.getKeyMetrics(ticker)
      await prisma.company.update({
        where: { ticker },
        data: {
          metricsData: metrics as any,
          metricsFetchedAt: new Date(),
        },
      })
      return metrics
    } catch (err) {
      if (company.metricsData) return company.metricsData as unknown as KeyMetrics
      throw err
    }
  },

  async getIncomeStatements(ticker, period, limit) {
    return getCachedStatements(ticker, period, limit, "income") as Promise<IncomeStatement[]>
  },

  async getBalanceSheets(ticker, period, limit) {
    return getCachedStatements(ticker, period, limit, "balance") as Promise<BalanceSheet[]>
  },

  async getCashFlowStatements(ticker, period, limit) {
    return getCachedStatements(ticker, period, limit, "cashflow") as Promise<CashFlowStatement[]>
  },

  async getPrices(ticker, from, to) {
    const company = await getOrCreateCompany(ticker)

    // Check if we have recent price data covering the requested range
    const latestCached = await prisma.priceCache.findFirst({
      where: { companyId: company.id },
      orderBy: { fetchedAt: "desc" },
    })

    if (!isStale(latestCached?.fetchedAt, PRICE_TTL_MS)) {
      const rows = await prisma.priceCache.findMany({
        where: {
          companyId: company.id,
          date: { gte: new Date(from), lte: new Date(to) },
        },
        orderBy: { date: "desc" },
      })
      if (rows.length > 0) {
        return rows.map((r): PriceBar => ({
          date: r.date.toISOString().split("T")[0],
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
          volume: Number(r.volume),
        }))
      }
    }

    const prices = await fmpProvider.getPrices(ticker, from, to)

    if (prices.length > 0) {
      try {
        await prisma.priceCache.deleteMany({ where: { companyId: company.id } })
        await prisma.priceCache.createMany({
          data: prices.map((p) => ({
            companyId: company.id,
            date: new Date(p.date),
            open: p.open,
            high: p.high,
            low: p.low,
            close: p.close,
            volume: BigInt(p.volume),
            fetchedAt: new Date(),
          })),
          skipDuplicates: true,
        })
      } catch {
        // Cache write failure is non-fatal — return live data
      }
    }

    return prices
  },
}

async function getCachedStatements(
  ticker: string,
  period: "annual" | "quarterly",
  limit: number,
  statement: "income" | "balance" | "cashflow"
) {
  const company = await getOrCreateCompany(ticker)

  const cached = await prisma.financials.findMany({
    where: { companyId: company.id, period, statement },
    orderBy: [{ fiscalYear: "desc" }, { fiscalQuarter: "desc" }],
    take: limit,
  })

  const freshEnough = cached.length > 0 && cached.every((r) => !isStale(r.fetchedAt, STMT_TTL_MS))
  if (freshEnough && cached.length >= limit) {
    return cached.map((r) => r.data)
  }

  // Fetch from FMP based on statement type
  let fresh: any[]
  try {
    if (statement === "income") fresh = await fmpProvider.getIncomeStatements(ticker, period, limit)
    else if (statement === "balance") fresh = await fmpProvider.getBalanceSheets(ticker, period, limit)
    else fresh = await fmpProvider.getCashFlowStatements(ticker, period, limit)
  } catch (err) {
    if (cached.length > 0) return cached.map((r) => r.data)
    throw err
  }

  // Upsert each statement row
  await Promise.all(
    fresh.map((row) =>
      prisma.financials.upsert({
        where: {
          companyId_period_fiscalYear_fiscalQuarter_statement: {
            companyId: company.id,
            period,
            fiscalYear: row.fiscalYear,
            fiscalQuarter: row.fiscalQuarter ?? 0,
            statement,
          },
        },
        create: {
          companyId: company.id,
          period,
          fiscalYear: row.fiscalYear,
          fiscalQuarter: row.fiscalQuarter ?? 0,
          statement,
          data: row,
          fetchedAt: new Date(),
        },
        update: { data: row, fetchedAt: new Date() },
      })
    )
  )

  return fresh
}
