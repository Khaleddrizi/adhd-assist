"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuthGuard } from "@/components/auth-guard"
import { fetchApi, getAuthHeaders, publicApiBase } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Users, UserPlus, Loader2, Copy, Check } from "lucide-react"

const ADHD_LEVELS = ["Mild", "Moderate", "Severe"] as const

interface TrainingProgram {
  id: number
  name: string
  status: string
  question_count: number
}

interface ParentLookupChild {
  id: number
  name: string
  age: number | null
  diagnostic?: string | null
  alexa_code?: string | null
}

interface ParentLookupResult {
  exists: boolean
  conflict_role?: "specialist"
  parent: {
    id: number
    email: string
    full_name: string | null
    phone?: string | null
  } | null
  children: ParentLookupChild[]
}

function AddPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [childName, setChildName] = useState("")
  const [childAge, setChildAge] = useState<number | "">("")
  const [adhdLevel, setAdhdLevel] = useState<string>("")
  const [parentName, setParentName] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState("none")
  const [parentLookup, setParentLookup] = useState<ParentLookupResult | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successData, setSuccessData] = useState<{ tempPassword?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadPrograms() {
      try {
        const items = await fetchApi<TrainingProgram[]>("/api/specialists/library")
        if (!cancelled) {
          setPrograms(items.filter((item) => item.status === "ready"))
        }
      } catch {
        if (!cancelled) {
          setPrograms([])
        }
      }
    }
    loadPrograms()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const email = parentEmail.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setParentLookup(null)
      setLookupLoading(false)
      return
    }

    let cancelled = false
    setLookupLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const result = await fetchApi<ParentLookupResult>(`/api/doctor/parent-lookup?email=${encodeURIComponent(email)}`)
        if (cancelled) return
        setParentLookup(result)
        if (result.exists && result.parent) {
          setParentName(result.parent.full_name || "")
          setParentPhone(result.parent.phone || "")
        }
      } catch {
        if (!cancelled) setParentLookup(null)
      } finally {
        if (!cancelled) setLookupLoading(false)
      }
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [parentEmail])

  const validate = (): boolean => {
    const err: Record<string, string> = {}
    if (!childName.trim()) err.childName = "Child name is required"
    const age = childAge === "" ? NaN : Number(childAge)
    if (isNaN(age) || age < 1 || age > 18) err.childAge = "Valid age (1-18) required"
    if (!adhdLevel) err.adhdLevel = "ADHD level is required"
    if (!parentName.trim() && !parentLookup?.exists) err.parentName = "Parent full name is required"
    if (!parentEmail.trim()) err.parentEmail = "Parent email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) err.parentEmail = "Invalid email format"
    if (parentLookup?.conflict_role === "specialist") err.parentEmail = "This email already belongs to a therapist"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || loading) return
    setLoading(true)
    setErrors({})
    try {
      const res = await fetch(`${publicApiBase}/api/doctor/add-patient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          child: {
            name: childName.trim(),
            age: Number(childAge),
            adhd_level: adhdLevel,
            assigned_program_id: selectedProgramId === "none" ? undefined : Number(selectedProgramId),
          },
          parent: {
            name: parentName.trim(),
            email: parentEmail.trim().toLowerCase(),
            phone: parentPhone.trim() || undefined,
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.error || (res.status === 404 ? "API route not found. Please restart the backend server (python run.py)." : "Failed to add patient")
        setLoading(false)
        alert(msg)
        return
      }
      setLoading(false)
      if (data.parent_temp_password) {
        setSuccessData({ tempPassword: data.parent_temp_password })
      } else {
        const familyCount = typeof data.family_children_count === "number" ? data.family_children_count : null
        toast.success(
          data.parent_created
            ? "Patient added and parent account linked."
            : familyCount && familyCount > 1
              ? `Patient added to the existing family account (${familyCount} children linked).`
              : "Patient added! The parent can log in with their existing account."
        )
        router.push("/orthophoniste/patients")
      }
    } catch (err) {
      setLoading(false)
      const msg = err instanceof Error ? err.message : "Network error"
      alert(msg + "\n\nMake sure the backend is running: python run.py")
    }
  }

  const handleCopyPassword = async () => {
    if (successData?.tempPassword) {
      await navigator.clipboard.writeText(successData.tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCloseSuccess = () => {
    setSuccessData(null)
    toast.success("Patient added successfully!")
    router.push("/orthophoniste/patients")
  }

  return (
    <div>
      {successData?.tempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="surface-card max-w-md w-full border-2 border-emerald-500/30 shadow-xl">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/30 border-b">
              <CardTitle className="text-emerald-800 dark:text-emerald-200">Patient Added Successfully</CardTitle>
              <p className="text-sm text-muted-foreground">Share this temporary password with the parent. They can log in at the parent login page and change it.</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-sm font-medium">Temporary password for parent</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    readOnly
                    value={successData.tempPassword}
                    className="font-mono bg-muted"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleCopyPassword} title="Copy">
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={handleCloseSuccess}>Done, go to Patients</Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Link href="/orthophoniste/patients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Patients
      </Link>

      <div className="max-w-4xl">
        <Card className="surface-card border-slate-200 dark:border-slate-700 shadow-md">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Patient
            </CardTitle>
            <p className="text-sm text-muted-foreground">Register a child and create or link a parent account</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-5 sm:space-y-6">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <Users className="h-4 w-4 text-primary" />
                    Child Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="childName" className="text-slate-700 dark:text-slate-300">Name</Label>
                    <Input
                      id="childName"
                      type="text"
                      placeholder="Child's full name"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className={`border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary/20 ${errors.childName ? "border-red-500" : ""}`}
                    />
                    {errors.childName && <p className="text-sm text-red-600 dark:text-red-400">{errors.childName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childAge" className="text-slate-700 dark:text-slate-300">Age</Label>
                    <Input
                      id="childAge"
                      type="number"
                      min={1}
                      max={18}
                      placeholder="e.g. 8"
                      value={childAge === "" ? "" : childAge}
                      onChange={(e) => setChildAge(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      className={`border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary/20 ${errors.childAge ? "border-red-500" : ""}`}
                    />
                    {errors.childAge && <p className="text-sm text-red-600 dark:text-red-400">{errors.childAge}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adhdLevel" className="text-slate-700 dark:text-slate-300">ADHD Level</Label>
                    <Select value={adhdLevel} onValueChange={setAdhdLevel}>
                      <SelectTrigger className={`border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary/20 ${errors.adhdLevel ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {ADHD_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.adhdLevel && <p className="text-sm text-red-600 dark:text-red-400">{errors.adhdLevel}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedProgram" className="text-slate-700 dark:text-slate-300">Assigned Program</Label>
                    <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                      <SelectTrigger id="assignedProgram" className="border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select a ready program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Assign later</SelectItem>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={String(program.id)}>
                            {program.name} ({program.question_count} questions)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      If selected, Alexa will use this program for the child immediately after linking.
                    </p>
                  </div>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Parent Account Creation
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="parentName" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                    <Input
                      id="parentName"
                      type="text"
                      placeholder="Parent's full name"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className={`border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary/20 ${errors.parentName ? "border-red-500" : ""}`}
                    />
                    {errors.parentName && <p className="text-sm text-red-600 dark:text-red-400">{errors.parentName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail" className="text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      placeholder="parent@example.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className={`border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary/20 ${errors.parentEmail ? "border-red-500" : ""}`}
                    />
                    {errors.parentEmail && <p className="text-sm text-red-600 dark:text-red-400">{errors.parentEmail}</p>}
                    {lookupLoading ? (
                      <p className="text-xs text-muted-foreground">Checking existing parent account...</p>
                    ) : parentLookup?.exists && parentLookup.parent ? (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                        <p className="font-medium">Existing parent account found.</p>
                        <p className="mt-1">
                          The new child will be linked to {parentLookup.parent.full_name || parentLookup.parent.email}.
                        </p>
                        {parentLookup.children.length > 0 ? (
                          <div className="mt-2">
                            <p className="text-xs uppercase tracking-wide opacity-80">Current children in this family</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {parentLookup.children.map((child) => (
                                <span key={child.id} className="rounded-full bg-white/80 px-2.5 py-1 text-xs text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
                                  {child.name} {child.age ? `(${child.age})` : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs opacity-80">This parent account exists but has no children linked to your dashboard yet.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone" className="text-slate-700 dark:text-slate-300">Phone</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary/20"
                    />
                    {parentLookup?.exists ? (
                      <p className="text-xs text-muted-foreground">Existing parent details were loaded automatically. You can still complete any missing information.</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto sm:px-8 bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Patient & Invite Parent"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requiredAccountType="therapist">
      <AddPatientPage />
    </AuthGuard>
  )
}
