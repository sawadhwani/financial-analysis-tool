import { AuthForm } from "@/components/auth/AuthForm"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = { title: "Sign In — FinSight" }

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/watchlist")

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">FinSight</h1>
        <AuthForm />
      </div>
    </main>
  )
}
