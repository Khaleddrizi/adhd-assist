"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchApi } from "@/lib/api"

interface AuditLog {
  id: number
  admin_id: number
  action: string
  target_type: string
  target_id: number | null
  details: Record<string, unknown>
  created_at: string | null
}

function AuditPageContent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [action, setAction] = useState("")
  const [targetType, setTargetType] = useState("")
  const [query, setQuery] = useState("")

  const load = async () => {
    const qs = new URLSearchParams()
    qs.set("limit", "100")
    if (action) qs.set("action", action)
    if (targetType) qs.set("target_type", targetType)
    if (query.trim()) qs.set("q", query.trim())
    const data = await fetchApi<AuditLog[]>(`/api/administration/audit-logs?${qs.toString()}`)
    setLogs(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track all administration actions and security events.</p>
      </div>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Action (e.g. doctor_status_update)" value={action} onChange={(e) => setAction(e.target.value)} />
          <Input placeholder="Target type (doctor/parent/child)" value={targetType} onChange={(e) => setTargetType(e.target.value)} />
          <Input placeholder="Search details JSON..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={load} className="w-full">Apply</Button>
            <Button
              variant="outline"
              onClick={() => {
                setAction("")
                setTargetType("")
                setQuery("")
                setTimeout(load, 0)
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {!logs.length ? (
            <p className="text-sm text-muted-foreground">No audit logs found.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                  <p className="text-sm font-medium">{log.action} - {log.target_type} #{log.target_id ?? "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">admin #{log.admin_id} - {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}</p>
                  <pre className="mt-2 text-xs bg-slate-50 dark:bg-slate-900 rounded p-2 overflow-auto">{JSON.stringify(log.details || {}, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuditPage() {
  return (
    <AuthGuard requiredAccountType="administration">
      <AuditPageContent />
    </AuthGuard>
  )
}
