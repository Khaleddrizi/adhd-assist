"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchApi } from "@/lib/api"
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react"
import { usePortalI18n } from "@/lib/i18n/i18n-context"
import type { AppLocale } from "@/lib/i18n/types"

interface IncidentsPayload {
  disabled_doctors: Array<{ id: number }>
  disabled_parents: Array<{ id: number }>
}

interface AuditLog {
  id: number
  action: string
  target_type: string
  target_id: number | null
  created_at: string | null
}

function formatLogWhen(iso: string | null, locale: AppLocale): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const tag = locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en"
  return d.toLocaleString(tag)
}

function SecurityPageContent() {
  const { t, locale } = usePortalI18n()
  const [incidents, setIncidents] = useState<IncidentsPayload | null>(null)
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const audit = await fetchApi<AuditLog[]>("/api/administration/audit-logs?limit=15")
      const incidentsData = await fetchApi<IncidentsPayload>("/api/administration/incidents")
      if (!cancelled) {
        setLogs(audit)
        setIncidents(incidentsData)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const disabledDoctorsCount = incidents?.disabled_doctors.length ?? 0
  const disabledParentsCount = incidents?.disabled_parents.length ?? 0
  const hasRisk = disabledDoctorsCount + disabledParentsCount > 0
  const riskN = disabledDoctorsCount + disabledParentsCount

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{t("security.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("security.subtitle")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasRisk ? <ShieldAlert className="h-5 w-5 text-red-600" /> : <ShieldCheck className="h-5 w-5 text-emerald-600" />}
              {t("security.integrityTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-semibold ${hasRisk ? "text-red-600" : "text-emerald-600"}`}>
              {hasRisk ? t("security.integrityAction") : t("security.integrityOk")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasRisk
                ? t("security.integrityHintRisk").replace("{count}", String(riskN))
                : t("security.integrityHintOk")}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {t("security.controlsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{t("security.control1")}</p>
            <p>{t("security.control2")}</p>
            <p>{t("security.control3")}</p>
            <p>{t("security.control4")}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>{t("security.auditTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!logs.length ? (
            <p className="text-sm text-muted-foreground">{t("security.auditEmpty")}</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
                  <p className="font-medium">
                    {log.action} — {log.target_type} #{log.target_id ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatLogWhen(log.created_at, locale)}</p>
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
