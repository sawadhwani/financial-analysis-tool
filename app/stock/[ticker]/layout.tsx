import { StockSidebar } from "@/components/stock/StockSidebar"

interface Props {
  children: React.ReactNode
  params: Promise<{ ticker: string }>
}

export default async function StockLayout({ children, params }: Props) {
  const { ticker } = await params
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StockSidebar ticker={ticker.toUpperCase()} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
