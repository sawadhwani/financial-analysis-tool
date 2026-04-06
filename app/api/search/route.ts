import { NextRequest, NextResponse } from "next/server"
import { dataProvider } from "@/lib/data"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 1) return NextResponse.json([])

  try {
    const results = await dataProvider.searchCompanies(q)
    return NextResponse.json(results)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
