"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchApi } from "@/lib/api"
import { toast } from "sonner"

interface AdminParent {
  id: number
  email: string
  full_name: string | null
  phone: string | null
  children_count: number
  is_active: boolean
}

function ParentsPageContent() {
  const [items, setItems] = useState<AdminParent[]>([])
  const [search, setSearch] = useState("")
  const disabledCount = items.filter((i) => !i.is_active).length

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await fetchApi<AdminParent[]>(`/api/administration/parents?q=${encodeURIComponent(search.trim())}`)
      if (!cancelled) setItems(data)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [search])

  const reload = async () => {
    const data = await fetchApi<AdminParent[]>(`/api/administration/parents?q=${encodeURIComponent(search.trim())}`)
    setItems(data)
  }

  const toggleStatus = async (row: AdminParent) => {
    const ok = window.confirm(
      `${row.is_active ? "Disable" : "Enable"} this parent account?\n\nThis action will be logged in Audit Logs.`
    )
    if (!ok) return
    try {
      await fetchApi(`/api/administration/parents/${row.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !row.is_active }),
      })
      toast.success(`Parent ${!row.is_active ? "enabled" : "disabled"} successfully. Check Audit Logs.`)
      await reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update parent status")
    }
  }

  const resetPassword = async (row: AdminParent) => {
    const ok = window.confirm(
      "Generate a temporary password for this parent?\n\nThis action will be logged in Audit Logs."
    )
    if (!ok) return
    try {
      const res = await fetchApi<{ temporary_password: string }>(`/api/administration/parents/${row.id}/reset-password`, {
        method: "POST",
      })
      await navigator.clipboard.writeText(res.temporary_password)
      toast.success("Temporary password copied to clipboard. Check Audit Logs.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset parent password")
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Parents Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Inspect parent accounts and linked children.</p>
      </div>
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Parents Directory</CardTitle>
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent</TableHead>
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
                  <TableCell>{row.children_count}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {row.is_active ? "Active" : "Disabled"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(row)}>
                      {row.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="outline" className="ml-2" onClick={() => resetPassword(row)}>
                      Reset Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No parents found.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Open Issues for Parents</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {disabledCount > 0 ? (
            <p>
              <span className="font-semibold text-red-600">{disabledCount}</span> disabled parent account(s) need review.
            </p>
          ) : (
            <p>No open parent account issues.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ParentsPage() {
  return (
    <AuthGuard requiredAccountType="administration">
      <ParentsPageContent />
    </AuthGuard>
  )
}
