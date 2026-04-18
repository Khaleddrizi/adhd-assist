"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAuthHeaders, publicApiBase } from "@/lib/api"
import { Star, KeyRound, BookOpen, Clock } from "lucide-react"

interface ApiChild {
  id: number
  name: string
  age: number | null
  diagnostic?: string | null
  alexa_code?: string | null
  stats: { total_sessions: number; total_correct: number; total_asked: number; avg_accuracy: number }
  assigned_program?: { id: number; name: string; question_count: number } | null
}

interface ApiSession {
  id: number
  score: number
  total_questions: number
  accuracy_pct: number
  created_at: string | null
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function statusFrom(stats: ApiChild["stats"]) {
  if (!stats.total_sessions || stats.avg_accuracy < 30) return { label: "يحتاج انتباهًا", cls: "bg-red-100 text-red-700" }
  if (stats.avg_accuracy < 70) return { label: "مراقبة", cls: "bg-amber-100 text-amber-700" }
  return { label: "على المسار", cls: "bg-emerald-100 text-emerald-700" }
}

function ChildDetailsContent() {
  const params = useParams<{ id: string }>()
  const childId = params?.id
  const [child, setChild] = useState<ApiChild | null>(null)
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [tab, setTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [childRes, sessionsRes] = await Promise.all([
          fetch(`${publicApiBase}/api/parents/children/${childId}`, { headers: getAuthHeaders() }),
          fetch(`${publicApiBase}/api/parents/children/${childId}/sessions?limit=30`, { headers: getAuthHeaders() }),
        ])
        if (cancelled) return
        if (childRes.ok) setChild(await childRes.json())
        if (sessionsRes.ok) setSessions(await sessionsRes.json())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [childId])

  const status = useMemo(() => statusFrom(child?.stats || { total_sessions: 0, avg_accuracy: 0, total_correct: 0, total_asked: 0 }), [child])
  const stars = child?.stats?.total_correct ?? 0
  const goalTarget = 50
  const goalProgress = Math.min(100, Math.round((stars / goalTarget) * 100))

  if (loading) return <p className="text-sm text-muted-foreground">جاري تحميل تفاصيل الطفل…</p>
  if (!child) return <p className="text-sm text-muted-foreground">لم يُعثر على الطفل.</p>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card className="surface-card">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{child.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{child.age != null ? `${child.age} سنة` : "—"}</Badge>
                <Badge variant="outline">{child.diagnostic || "بدون مستوى"}</Badge>
                <Badge className={status.cls}>{status.label}</Badge>
                <code className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {child.alexa_code || "—"}
                </code>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/reports">عرض التقارير الكاملة</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sessions">الجلسات</TabsTrigger>
          <TabsTrigger value="rewards">المكافآت</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "overview" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-sm">البرنامج المعيّن</CardTitle></CardHeader>
            <CardContent>
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-2"><BookOpen className="h-3.5 w-3.5" /> برنامج التعلم الحالي</div>
              <p className="font-semibold">{child.assigned_program?.name || "لا يوجد برنامج معيّن"}</p>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-sm">رمز الطفل</CardTitle></CardHeader>
            <CardContent>
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-2"><KeyRound className="h-3.5 w-3.5" /> استخدم هذا الرمز كما هو للطفل</div>
              <code className="rounded bg-slate-100 px-2 py-1 font-mono dark:bg-slate-800">{child.alexa_code || "—"}</code>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-sm">الأداء</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm text-muted-foreground">متوسط الدقة</p>
              <p className="text-2xl font-bold">{Math.round(child.stats.avg_accuracy || 0)}%</p>
              <p className="text-xs text-muted-foreground">{child.stats.total_sessions} جلسة مكتملة</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "sessions" ? (
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>آخر الجلسات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النتيجة</TableHead>
                  <TableHead>الأسئلة</TableHead>
                  <TableHead>الدقة</TableHead>
                  <TableHead>المدة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">لا توجد جلسات بعد.</TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{formatDateTime(s.created_at)}</TableCell>
                      <TableCell>{s.score}/{s.total_questions}</TableCell>
                      <TableCell>{s.total_questions}</TableCell>
                      <TableCell>{s.accuracy_pct}%</TableCell>
                      <TableCell>{Math.max(1, s.total_questions) * 20}s</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "rewards" ? (
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> المكافآت والهدف</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">الهدف الحالي: 50 نجمة</p>
            <p className="text-2xl font-bold">{stars}/{goalTarget}</p>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: `${goalProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {goalProgress >= 100 ? "تم تحقيق الهدف!" : `${goalTarget - stars} نجمة متبقية`}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export default function ChildDetailsPage() {
  return (
    <AuthGuard requiredAccountType="parent">
      <ChildDetailsContent />
    </AuthGuard>
  )
}
