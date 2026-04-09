"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchApi } from "@/lib/api"
import { toast } from "sonner"

interface AdminChild {
  id: number
  name: string
  age: number | null
  diagnostic: string | null
  doctor_name: string
  parent_name: string
  parent_email?: string | null
  sessions_count: number
  avg_accuracy: number
}

interface OptionItem { id: number; full_name: string | null; email: string }

function ChildrenPageContent() {
  const [items, setItems] = useState<AdminChild[]>([])
  const [search, setSearch] = useState("")
  const [parents, setParents] = useState<OptionItem[]>([])
  const [doctors, setDoctors] = useState<OptionItem[]>([])
  const [selectedParent, setSelectedParent] = useState<Record<number, string>>({})
  const [selectedDoctor, setSelectedDoctor] = useState<Record<number, string>>({})
  const orphanCount = items.filter((i) => !i.parent_email).length

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await fetchApi<AdminChild[]>(`/api/administration/children?q=${encodeURIComponent(search.trim())}`)
      if (!cancelled) setItems(data)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [search])

  useEffect(() => {
    let cancelled = false
    async function loadRefs() {
      const [p, d] = await Promise.all([
        fetchApi<OptionItem[]>("/api/administration/parents"),
        fetchApi<OptionItem[]>("/api/administration/doctors"),
      ])
      if (cancelled) return
      setParents(p)
      setDoctors(d)
    }
    loadRefs()
    return () => {
      cancelled = true
    }
  }, [])

  const transfer = async (row: AdminChild) => {
    const parentId = selectedParent[row.id]
    const doctorId = selectedDoctor[row.id]
    if (!parentId && !doctorId) {
      toast.error("Select a new parent and/or doctor first")
      return
    }
    try {
      await fetchApi(`/api/administration/children/${row.id}/transfer`, {
        method: "PUT",
        body: JSON.stringify({
          parent_id: parentId ? Number(parentId) : undefined,
          specialist_id: doctorId ? Number(doctorId) : undefined,
        }),
      })
      toast.success("Child ownership updated")
      const data = await fetchApi<AdminChild[]>(`/api/administration/children?q=${encodeURIComponent(search.trim())}`)
      setItems(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transfer failed")
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Children Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor child ownership, diagnosis, and learning activity.</p>
      </div>
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Children Registry</CardTitle>
          <Input placeholder="Search child by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Age / ADHD</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Transfer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.age ?? "—"} / {row.diagnostic || "—"}</TableCell>
                  <TableCell>{row.doctor_name}</TableCell>
                  <TableCell>{row.parent_name}</TableCell>
                  <TableCell>{row.sessions_count}</TableCell>
                  <TableCell>{Math.round(row.avg_accuracy || 0)}%</TableCell>
                  <TableCell className="space-y-2 min-w-[260px]">
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                      value={selectedParent[row.id] || ""}
                      onChange={(e) => setSelectedParent((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    >
                      <option value="">Change parent...</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                      ))}
                    </select>
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                      value={selectedDoctor[row.id] || ""}
                      onChange={(e) => setSelectedDoctor((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    >
                      <option value="">Change doctor...</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>{d.full_name || d.email}</option>
                      ))}
                    </select>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => transfer(row)}>Apply Transfer</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">No children found.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Open Issues for Children</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {orphanCount > 0 ? (
            <p>
              <span className="font-semibold text-red-600">{orphanCount}</span> child profile(s) are not linked to a parent account.
            </p>
          ) : (
            <p>No open child-linking issues.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ChildrenPage() {
  return (
    <AuthGuard requiredAccountType="administration">
      <ChildrenPageContent />
    </AuthGuard>
  )
}
