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

  const comps = await prisma.savedComp.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(comps)
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, tickers } = await req.json()
  if (!name || !Array.isArray(tickers)) return NextResponse.json({ error: "name and tickers required" }, { status: 400 })

  const comp = await prisma.savedComp.create({
    data: { userId: user.id, name, tickers },
  })
  return NextResponse.json(comp)
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  await prisma.savedComp.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ ok: true })
}
