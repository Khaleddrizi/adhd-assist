"use client"

import { useEffect, useMemo, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { getAuthHeaders } from "@/lib/api"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

interface ApiChild {
  id: number
  name: string
  stats: { total_sessions: number; avg_accuracy: number }
}

interface ApiSession {
  id: number
  patient_id: number
  score: number
  accuracy_pct: number
  created_at: string | null
}

type RangeKey = "7d" | "30d" | "all"

function withinRange(value: string | null, range: RangeKey) {
  if (!value) return false
  if (range === "all") return true
  const now = new Date()
  const d = new Date(value)
  const days = range === "7d" ? 7 : 30
  const threshold = new Date(now)
  threshold.setDate(now.getDate() - (days - 1))
  return d >= threshold
}

function ReportsPageContent() {
  const [children, setChildren] = useState<ApiChild[]>([])
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [range, setRange] = useState<RangeKey>("30d")

  useEffect(() => {
    let cancelled = false
    async function load() {
      const childrenRes = await fetch(`${API_BASE}/api/parents/children`, { headers: getAuthHeaders() })
      if (!childrenRes.ok || cancelled) return
      const kids: ApiChild[] = await childrenRes.json()
      if (cancelled) return
      setChildren(kids)

      const allSessions: ApiSession[] = []
      for (const child of kids) {
        const r = await fetch(`${API_BASE}/api/parents/children/${child.id}/sessions?limit=60`, { headers: getAuthHeaders() })
        if (r.ok) {
          const data: ApiSession[] = await r.json()
          allSessions.push(...data.map((s) => ({ ...s, patient_id: child.id })))
        }
      }
      if (!cancelled) setSessions(allSessions)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => sessions.filter((s) => withinRange(s.created_at, range)), [sessions, range])

  const byChild = useMemo(() => {
    return children.map((child) => {
      const own = filtered.filter((s) => s.patient_id === child.id)
      const avg = own.length ? own.reduce((sum, s) => sum + s.accuracy_pct, 0) / own.length : 0
      return { name: child.name, sessions: own.length, avgAccuracy: Math.round(avg) }
    })
  }, [children, filtered])

  const totalSessions = filtered.length
  const overallAccuracy = filtered.length ? Math.round(filtered.reduce((s, x) => s + x.accuracy_pct, 0) / filtered.length) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Family performance insights across children and sessions.</p>
        </div>
        <ButtonGroup>
          <Button size="sm" variant={range === "7d" ? "default" : "outline"} onClick={() => setRange("7d")}>7 days</Button>
          <Button size="sm" variant={range === "30d" ? "default" : "outline"} onClick={() => setRange("30d")}>30 days</Button>
          <Button size="sm" variant={range === "all" ? "default" : "outline"} onClick={() => setRange("all")}>All</Button>
        </ButtonGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="surface-card">
          <CardHeader><CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Total Sessions</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalSessions}</p></CardContent>
        </Card>
        <Card className="surface-card">
          <CardHeader><CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Overall Accuracy</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{overallAccuracy}%</p></CardContent>
        </Card>
      </div>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Performance by Child</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byChild} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: "currentColor" }} />
                <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                <Tooltip />
                <Bar dataKey="avgAccuracy" name="Avg Accuracy %" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <AuthGuard requiredAccountType="parent">
      <ReportsPageContent />
    </AuthGuard>
  )
}
