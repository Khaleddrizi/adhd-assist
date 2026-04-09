"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Doctor = Admin: redirect to orthophoniste
export default function AdminPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/orthophoniste")
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
