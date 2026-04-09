"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAuthHeaders } from "@/lib/api"
import { Search, ChevronRight, KeyRound } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

interface ApiChild {
  id: number
  name: string
  age: number | null
  diagnostic?: string | null
  alexa_code?: string | null
  stats: { total_sessions: number; avg_accuracy: number }
}

function statusFrom(stats: ApiChild["stats"]) {
  if (!stats.total_sessions || stats.avg_accuracy < 30) return { label: "Needs Attention", cls: "bg-red-100 text-red-700" }
  if (stats.avg_accuracy < 70) return { label: "Monitor", cls: "bg-amber-100 text-amber-700" }
  return { label: "On Track", cls: "bg-emerald-100 text-emerald-700" }
}

function severityCls(level: string | null | undefined) {
  if (level === "Mild") return "bg-amber-100 text-amber-700"
  if (level === "Moderate") return "bg-orange-100 text-orange-700"
  if (level === "Severe") return "bg-red-100 text-red-700"
  return "bg-slate-100 text-slate-700"
}

function ChildrenPageContent() {
  const [children, setChildren] = useState<ApiChild[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/parents/children`, { headers: getAuthHeaders() })
        if (!res.ok || cancelled) return
        const data: ApiChild[] = await res.json()
        if (!cancelled) setChildren(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return children
    return children.filter((c) => c.name.toLowerCase().includes(q))
  }, [children, query])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Children</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose a child to view detailed progress, sessions, and rewards.</p>
      </div>

      <Card className="surface-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by child name..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Linked Children</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No children found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((child) => {
                const status = statusFrom(child.stats)
                return (
                  <Link
                    key={child.id}
                    href={`/dashboard/children/${child.id}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 hover:border-primary/50 hover:bg-slate-50/70 transition-colors dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{child.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{child.age ?? "—"} yrs</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className={severityCls(child.diagnostic)}>{child.diagnostic || "No level"}</Badge>
                      <Badge className={status.cls}>{status.label}</Badge>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <KeyRound className="h-3.5 w-3.5" />
                      <code className="rounded bg-slate-100 px-2 py-0.5 font-mono dark:bg-slate-800">{child.alexa_code || "—"}</code>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ChildrenPage() {
  return (
    <AuthGuard requiredAccountType="parent">
      <ChildrenPageContent />
    </AuthGuard>
  )
}
