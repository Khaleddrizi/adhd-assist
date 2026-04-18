"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchApi } from "@/lib/api"
import { toast } from "sonner"
import {
  AdminManagementHeader,
  AdminEntityKpiCard,
  AdminIssuesStrip,
  AdminDirectoryToolbar,
  StatusPill,
  entityStatusFromAccount,
  avatarInitial,
  formatJoinedDate,
} from "@/components/admin/admin-entity-pages"
import {
  AlertTriangle,
  BarChart3,
  Lock,
  Plus,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminDoctor {
  id: number
  email: string
  full_name: string | null
  phone: string | null
  created_at: string | null
  patients_count: number
  is_active: boolean
}

function DoctorsPageContent() {
  const [items, setItems] = useState<AdminDoctor[]>([])
  const [search, setSearch] = useState("")
  const [inactiveOnly, setInactiveOnly] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await fetchApi<AdminDoctor[]>(`/api/administration/doctors?q=${encodeURIComponent(search.trim())}`)
      if (!cancelled) setItems(data)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [search])

  const reload = async () => {
    const data = await fetchApi<AdminDoctor[]>(`/api/administration/doctors?q=${encodeURIComponent(search.trim())}`)
    setItems(data)
  }

  const totalPatients = useMemo(() => items.reduce((sum, i) => sum + (i.patients_count || 0), 0), [items])
  const disabledCount = useMemo(() => items.filter((i) => !i.is_active).length, [items])
  const avgPerDoctor = items.length ? Math.round(totalPatients / items.length) : 0

  const filteredItems = useMemo(() => {
    if (!inactiveOnly) return items
    return items.filter((i) => !i.is_active)
  }, [items, inactiveOnly])

  const toggleStatus = async (doctor: AdminDoctor) => {
    const ok = window.confirm(
      `${doctor.is_active ? "تعطيل" : "تفعيل"} حساب هذا المختص؟\n\nسيُسجّل الإجراء في سجل التدقيق.`,
    )
    if (!ok) return
    try {
      await fetchApi(`/api/administration/doctors/${doctor.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !doctor.is_active }),
      })
      toast.success(`تم ${!doctor.is_active ? "تفعيل" : "تعطيل"} المختص بنجاح. راجع سجل التدقيق.`)
      await reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّر تحديث حالة المختص")
    }
  }

  const resetPassword = async (doctor: AdminDoctor) => {
    const ok = window.confirm(
      "إنشاء كلمة مرور مؤقتة لهذا المختص؟\n\nسيُسجّل الإجراء في سجل التدقيق.",
    )
    if (!ok) return
    try {
      const res = await fetchApi<{ temporary_password: string }>(
        `/api/administration/doctors/${doctor.id}/reset-password`,
        { method: "POST" },
      )
      await navigator.clipboard.writeText(res.temporary_password)
      toast.success("تم نسخ كلمة المرور المؤقتة. راجع سجل التدقيق.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّر إعادة تعيين كلمة المرور")
    }
  }

  const th = "text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-6">
      <AdminManagementHeader
        title="إدارة المختصين"
        description="مراجعة حسابات المختصين وحمل المرضى المعيّن."
        action={
          <Button asChild className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/register?role=specialist" target="_blank" rel="noopener noreferrer">
              <Plus className="h-4 w-4" />
              إضافة مختص
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminEntityKpiCard
          label="إجمالي المختصين"
          value={items.length}
          subtitle="مختصون مسجّلون على المنصة"
          iconWrapClass="bg-blue-500/10"
          customIcon={
            <span className="flex items-center justify-center gap-px text-blue-600 dark:text-blue-400" aria-hidden>
              <Stethoscope className="h-3.5 w-3.5" />
              <Plus className="h-3 w-3" strokeWidth={2.5} />
            </span>
          }
        />
        <AdminEntityKpiCard
          label="إجمالي الأطفال المعيّنين"
          value={totalPatients}
          subtitle="أطفال مرتبطون بالمختصين"
          icon={Users}
          iconWrapClass="bg-teal-500/10"
          iconClass="text-teal-600 dark:text-teal-400"
        />
        <AdminEntityKpiCard
          label="متوسط الأطفال لكل مختص"
          value={avgPerDoctor}
          subtitle="متوسط حمل المرضى لكل مختص"
          icon={BarChart3}
          iconWrapClass="bg-purple-500/10"
          iconClass="text-purple-600 dark:text-purple-400"
        />
      </div>

      {disabledCount === 0 ? (
        <AdminIssuesStrip
          variant="success"
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />}
        >
          لا مشاكل مفتوحة لحسابات المختصين — كل الحسابات سليمة
        </AdminIssuesStrip>
      ) : (
        <AdminIssuesStrip
          variant="warning"
          icon={<AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />}
        >
          {disabledCount} حساب{disabledCount === 1 ? "" : "ات"} مختص بها مشاكل مفتوحة — راجع أدناه
        </AdminIssuesStrip>
      )}

      <Card className="overflow-hidden border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <AdminDirectoryToolbar
          title="دليل المختصين"
          titleIcon={<Stethoscope className="h-5 w-5 shrink-0 text-primary" aria-hidden />}
          searchPlaceholder="بحث بالاسم أو البريد…"
          search={search}
          onSearchChange={setSearch}
          filterActive={inactiveOnly}
          onFilterClick={() => setInactiveOnly((v) => !v)}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent dark:border-slate-800">
                  <TableHead className={th}>المختص</TableHead>
                  <TableHead className={th}>البريد</TableHead>
                  <TableHead className={th}>الهاتف</TableHead>
                  <TableHead className={th}>المرضى</TableHead>
                  <TableHead className={th}>الحالة</TableHead>
                  <TableHead className={cn(th, "text-right")}>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((row) => {
                  const status = entityStatusFromAccount(row.is_active, row.patients_count, row.created_at)
                  const name = row.full_name || row.email
                  return (
                    <TableRow
                      key={row.id}
                      className="border-slate-100 transition-colors hover:bg-[#f9fafb] dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
                            aria-hidden
                          >
                            {avatarInitial(row.full_name, row.email)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              انضم {formatJoinedDate(row.created_at)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${row.email}`}
                          className="text-[13px] font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {row.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {row.phone ? (
                          <span className="text-[13px] text-slate-700 dark:text-slate-300">{row.phone}</span>
                        ) : (
                          <span className="text-[13px] italic text-slate-400 dark:text-slate-500">لا هاتف</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] font-bold tabular-nums text-slate-900 dark:text-white">
                          {row.patients_count}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusPill kind={status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {row.is_active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 border-amber-300 bg-transparent text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
                              onClick={() => toggleStatus(row)}
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              تعطيل
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 border-emerald-400 bg-transparent text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                              onClick={() => toggleStatus(row)}
                            >
                              تفعيل
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                            onClick={() => resetPassword(row)}
                          >
                            <Lock className="h-3.5 w-3.5" />
                            إعادة كلمة المرور
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!filteredItems.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      لا يوجد مختصون.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DoctorsPage() {
  return (
    <AuthGuard requiredAccountType="administration">
      <DoctorsPageContent />
    </AuthGuard>
  )
}
