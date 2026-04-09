"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchApi } from "@/lib/api"
import { ShieldCheck, Stethoscope, Users, Baby, Bot, Activity, AlertTriangle } from "lucide-react"

interface AdminOverview {
  total_doctors: number
  total_parents: number
  total_children: number
  total_alexa_users: number
  sessions_today: number
  orphan_children: number
}

interface IncidentsPayload {
  disabled_doctors: Array<{ id: number; email: string; full_name: string | null }>
  disabled_parents: Array<{ id: number; email: string; full_name: string | null }>
  orphan_children: Array<{ id: number; name: string; age: number | null; diagnostic: string | null }>
}

function AdministrationHome() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [incidents, setIncidents] = useState<IncidentsPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [data, incidentsData] = await Promise.all([
          fetchApi<AdminOverview>("/api/administration/overview"),
          fetchApi<IncidentsPayload>("/api/administration/incidents"),
        ])
        if (!cancelled) {
          setOverview(data)
          setIncidents(incidentsData)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const disabledDoctors = incidents?.disabled_doctors || []
  const disabledParents = incidents?.disabled_parents || []
  const orphanChildren = incidents?.orphan_children || []
  const totalIncidents = disabledDoctors.length + disabledParents.length + orphanChildren.length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Administration Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Organize accounts, monitor system activity, and protect platform data.</p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Doctors</p><p className="text-3xl font-bold mt-1">{overview?.total_doctors ?? 0}</p><Stethoscope className="h-5 w-5 text-primary mt-2" /></CardContent></Card>
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Parents</p><p className="text-3xl font-bold mt-1">{overview?.total_parents ?? 0}</p><Users className="h-5 w-5 text-cyan-600 mt-2" /></CardContent></Card>
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Children</p><p className="text-3xl font-bold mt-1">{overview?.total_children ?? 0}</p><Baby className="h-5 w-5 text-emerald-600 mt-2" /></CardContent></Card>
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Alexa Users</p><p className="text-3xl font-bold mt-1">{overview?.total_alexa_users ?? 0}</p><Bot className="h-5 w-5 text-violet-600 mt-2" /></CardContent></Card>
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Sessions Today</p><p className="text-3xl font-bold mt-1">{overview?.sessions_today ?? 0}</p><Activity className="h-5 w-5 text-amber-600 mt-2" /></CardContent></Card>
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Orphan Children</p><p className={`text-3xl font-bold mt-1 ${(overview?.orphan_children ?? 0) > 0 ? "text-red-600" : ""}`}>{overview?.orphan_children ?? 0}</p><ShieldCheck className="h-5 w-5 text-red-600 mt-2" /></CardContent></Card>
      </div>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${totalIncidents > 0 ? "text-red-600" : "text-emerald-600"}`} />
            Incident Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            - Open incidents: <strong className={totalIncidents > 0 ? "text-red-600" : "text-emerald-600"}>{totalIncidents}</strong>
            {" "}(Doctors: {disabledDoctors.length}, Parents: {disabledParents.length}, Orphan children: {orphanChildren.length})
          </p>
          <p>- Resolve doctor issues in <Link href="/administration/doctors" className="underline">Doctors</Link>.</p>
          <p>- Resolve parent issues in <Link href="/administration/parents" className="underline">Parents</Link>.</p>
          <p>- Resolve orphan child ownership in <Link href="/administration/children" className="underline">Children</Link>.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdministrationPage() {
  return (
    <AuthGuard requiredAccountType="administration">
      <AdministrationHome />
    </AuthGuard>
  )
}
