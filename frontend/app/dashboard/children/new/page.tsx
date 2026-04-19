"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthHeaders, publicApiBase } from "@/lib/api"
import { usePortalI18n } from "@/lib/i18n/i18n-context"
import { toast } from "sonner"

function AddChildForm() {
  const { t } = usePortalI18n()
  const router = useRouter()
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [diagnostic, setDiagnostic] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error(t("addChild.errName"))
      return
    }
    setSaving(true)
    try {
      const body: { name: string; age?: number; diagnostic?: string } = { name: trimmed }
      const ageNum = age.trim() === "" ? NaN : Number(age)
      if (!Number.isNaN(ageNum) && ageNum >= 0) body.age = Math.floor(ageNum)
      const d = diagnostic.trim()
      if (d) body.diagnostic = d
      const res = await fetch(`${publicApiBase}/api/parents/children`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || t("addChild.errCreate"))
      }
      toast.success(t("addChild.success"))
      router.replace("/dashboard/children")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("addChild.errCreate"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-6">
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>{t("addChild.title")}</CardTitle>
          <CardDescription>{t("addChild.subtitle")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="child-name">{t("addChild.name")}</Label>
              <Input id="child-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("addChild.namePh")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="child-age">{t("addChild.age")}</Label>
              <Input
                id="child-age"
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={t("addChild.agePh")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="child-diag">{t("addChild.diagnostic")}</Label>
              <Input id="child-diag" value={diagnostic} onChange={(e) => setDiagnostic(e.target.value)} placeholder={t("addChild.diagnosticPh")} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 justify-end border-t bg-muted/20">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/children">{t("addChild.cancel")}</Link>
            </Button>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-cyan-500">
              {saving ? t("addChild.submitting") : t("addChild.submit")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function ParentAddChildPage() {
  return (
    <AuthGuard requiredAccountType="parent">
      <AddChildForm />
    </AuthGuard>
  )
}
