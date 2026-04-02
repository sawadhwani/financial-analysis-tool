// Central data provider — swap the import below to change the data source.
// All consumers import from this file, not from provider-specific modules.
import { fmpProvider } from "./fmp"
import type { DataProvider } from "./types"

export const dataProvider: DataProvider = fmpProvider

export type {
  DataProvider,
  CompanyProfile,
  PriceBar,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyMetrics,
} from "./types"
