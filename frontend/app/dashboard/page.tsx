"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAuthHeaders, publicApiBase } from "@/lib/api"
import { ArrowRight, Users, BarChart3, Activity, Star } from "lucide-react"

interface ApiChild {
  id: number
  name: string
  stats: { total_sessions: number; total_correct: number; avg_accuracy: number }
}

function ParentPortalContent() {
  const [children, setChildren] = useState<ApiChild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${publicApiBase}/api/parents/children`, { headers: getAuthHeaders() })
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

  const totals = useMemo(() => {
    const totalChildren = children.length
    const totalSessions = children.reduce((sum, c) => sum + (c.stats?.total_sessions ?? 0), 0)
    const totalStars = children.reduce((sum, c) => sum + (c.stats?.total_correct ?? 0), 0)
    const avgAccuracy = totalChildren
      ? Math.round(children.reduce((sum, c) => sum + (c.stats?.avg_accuracy ?? 0), 0) / totalChildren)
      : 0
    return { totalChildren, totalSessions, totalStars, avgAccuracy }
  }, [children])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Parent Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Quick snapshot, then jump to Children or Reports for details.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-card">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Children</p>
            <p className="text-3xl font-bold mt-1">{totals.totalChildren}</p>
            <Users className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Sessions</p>
            <p className="text-3xl font-bold mt-1">{totals.totalSessions}</p>
            <Activity className="h-5 w-5 text-cyan-600 mt-2" />
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Stars</p>
            <p className="text-3xl font-bold mt-1">{totals.totalStars}</p>
            <Star className="h-5 w-5 text-amber-500 mt-2" />
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Average Accuracy</p>
            <p className="text-3xl font-bold mt-1">{totals.avgAccuracy}%</p>
            <BarChart3 className="h-5 w-5 text-emerald-600 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Children Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View each child profile with internal tabs: Overview, Sessions, and Rewards.
            </p>
            <Button asChild>
              <Link href="/dashboard/children">
                Open Children
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Reports Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze family-level progress with period filters and comparison charts.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/reports">
                Open Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ParentDashboardPage() {
  return (
    <AuthGuard requiredAccountType="parent">
      <ParentPortalContent />
    </AuthGuard>
  )
}
