import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const items = await prisma.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(items.map((i) => i.ticker))
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ticker } = await req.json()
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 })

  await prisma.watchlistItem.upsert({
    where: { userId_ticker: { userId: user.id, ticker: ticker.toUpperCase() } },
    create: { userId: user.id, ticker: ticker.toUpperCase() },
    update: {},
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ticker } = await req.json()
  await prisma.watchlistItem.deleteMany({
    where: { userId: user.id, ticker: ticker.toUpperCase() },
  })
  return NextResponse.json({ ok: true })
}
