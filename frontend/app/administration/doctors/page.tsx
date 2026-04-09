"use client"

import { useEffect, useMemo, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchApi } from "@/lib/api"
import { toast } from "sonner"

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

  const totalPatients = useMemo(() => items.reduce((sum, i) => sum + (i.patients_count || 0), 0), [items])
  const disabledCount = useMemo(() => items.filter((i) => !i.is_active).length, [items])

  const reload = async () => {
    const data = await fetchApi<AdminDoctor[]>(`/api/administration/doctors?q=${encodeURIComponent(search.trim())}`)
    setItems(data)
  }

  const toggleStatus = async (doctor: AdminDoctor) => {
    const ok = window.confirm(
      `${doctor.is_active ? "Disable" : "Enable"} this doctor account?\n\nThis action will be logged in Audit Logs.`
    )
    if (!ok) return
    try {
      await fetchApi(`/api/administration/doctors/${doctor.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !doctor.is_active }),
      })
      toast.success(`Doctor ${!doctor.is_active ? "enabled" : "disabled"} successfully. Check Audit Logs.`)
      await reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update doctor status")
    }
  }

  const resetPassword = async (doctor: AdminDoctor) => {
    const ok = window.confirm(
      "Generate a temporary password for this doctor?\n\nThis action will be logged in Audit Logs."
    )
    if (!ok) return
    try {
      const res = await fetchApi<{ temporary_password: string }>(`/api/administration/doctors/${doctor.id}/reset-password`, { method: "POST" })
      await navigator.clipboard.writeText(res.temporary_password)
      toast.success("Temporary password copied to clipboard. Check Audit Logs.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset password")
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Doctors Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review doctor accounts and assigned patient load.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Doctors</p><p className="text-3xl font-bold mt-1">{items.length}</p></CardContent></Card>
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Total Assigned Children</p><p className="text-3xl font-bold mt-1">{totalPatients}</p></CardContent></Card>
        <Card className="surface-card"><CardContent className="pt-6"><p className="text-xs uppercase tracking-wider text-muted-foreground">Average Children per Doctor</p><p className="text-3xl font-bold mt-1">{items.length ? Math.round(totalPatients / items.length) : 0}</p></CardContent></Card>
      </div>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Open Issues for Doctors</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {disabledCount > 0 ? (
            <p>
              <span className="font-semibold text-red-600">{disabledCount}</span> disabled doctor account(s) need review.
            </p>
          ) : (
            <p>No open doctor account issues.</p>
          )}
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Doctors Directory</CardTitle>
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Children</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.full_name || "—"}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone || "—"}</TableCell>
                  <TableCell>{row.patients_count}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {row.is_active ? "Active" : "Disabled"}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(row)}>
                      {row.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => resetPassword(row)}>
                      Reset Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No doctors found.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
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
