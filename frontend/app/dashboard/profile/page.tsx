"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"

function RedirectInner() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/settings")
  }, [router])
  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-sm text-muted-foreground">جاري التوجيه إلى الإعدادات…</p>
    </div>
  )
}

/** @deprecated استخدم `/dashboard/settings` — يُبقى للروابط القديمة. */
export default function ProfileRedirectPage() {
  return (
    <AuthGuard requiredAccountType="parent">
      <RedirectInner />
    </AuthGuard>
  )
}
