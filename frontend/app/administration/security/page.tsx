"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchApi } from "@/lib/api"
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react"

interface AdminOverview {
  total_doctors: number
  total_parents: number
  total_children: number
  total_alexa_users: number
  sessions_today: number
  orphan_children: number
}

interface AuditLog {
  id: number
  action: string
  target_type: string
  target_id: number | null
  created_at: string | null
}

function SecurityPageContent() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [data, audit] = await Promise.all([
        fetchApi<AdminOverview>("/api/administration/overview"),
        fetchApi<AuditLog[]>("/api/administration/audit-logs?limit=15"),
      ])
      if (!cancelled) {
        setOverview(data)
        setLogs(audit)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const hasRisk = (overview?.orphan_children ?? 0) > 0

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Security & Data Protection</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track integrity indicators and respond to account linkage issues.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasRisk ? <ShieldAlert className="h-5 w-5 text-red-600" /> : <ShieldCheck className="h-5 w-5 text-emerald-600" />}
              Integrity Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-semibold ${hasRisk ? "text-red-600" : "text-emerald-600"}`}>
              {hasRisk ? "Action Required" : "Healthy"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasRisk
                ? `There are ${overview?.orphan_children ?? 0} children without parent linkage.`
                : "All children are properly linked to parent accounts."}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Recommended Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Review orphan children in the `Children` page.</p>
            <p>- Confirm doctor-parent ownership consistency before interventions.</p>
            <p>- Keep admin account count minimal and monitored.</p>
            <p>- Rotate admin passwords periodically.</p>
          </CardContent>
        </Card>
      </div>
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Recent Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {!logs.length ? (
            <p className="text-sm text-muted-foreground">No audit logs yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
                  <p className="font-medium">{log.action} — {log.target_type} #{log.target_id ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{log.created_at ? new Date(log.created_at).toLocaleString() : "—"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function SecurityPage() {
  return (
    <AuthGuard requiredAccountType="administration">
      <SecurityPageContent />
    </AuthGuard>
  )
}
