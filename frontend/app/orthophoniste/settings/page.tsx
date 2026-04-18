"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchApi } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  ShieldCheck,
  UserCircle2,
  User,
  Bell,
  Globe2,
  TriangleAlert,
  Eye,
  EyeOff,
  Check,
  X,
  Lock,
  LogOut,
  Trash2,
  Camera,
} from "lucide-react"

interface SpecialistProfile {
  id: number
  email: string
  full_name: string | null
  phone?: string | null
  created_at?: string | null
}

type SettingsNavItem = "profile" | "password" | "notifications" | "language" | "danger"

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "DR"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function passwordStrength(password: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!password) return { score: 0, label: "فارغ" }
  if (password.length < 6) return { score: 1, label: "ضعيف" }
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  if (password.length >= 8 && hasUpper && hasNumber && hasSpecial) return { score: 4, label: "قوي" }
  if (password.length >= 8 && hasNumber) return { score: 3, label: "جيد" }
  return { score: 2, label: "مقبول" }
}

function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
  })
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [activeNav, setActiveNav] = useState<SettingsNavItem>("profile")

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchApi<SpecialistProfile>("/api/specialists/me")
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "تعذّر تحميل الملف الشخصي")
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const syncStoredUser = (full_name: string, email: string) => {
    const raw = localStorage.getItem("adhdAssistCurrentUser")
    if (!raw) return
    try {
      const user = JSON.parse(raw)
      user.full_name = full_name
      user.email = email
      localStorage.setItem("adhdAssistCurrentUser", JSON.stringify(user))
    } catch {
      //
    }
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const data = await fetchApi<SpecialistProfile>("/api/specialists/me", {
        method: "PUT",
        body: JSON.stringify(profile),
      })
      syncStoredUser(data.full_name || "", data.email)
      toast.success("تم تحديث الملف الشخصي بنجاح")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر تحديث الملف الشخصي")
    } finally {
      setSavingProfile(false)
    }
  }

  const scrollToSection = (id: SettingsNavItem) => {
    setActiveNav(id)
    const el = document.getElementById(`settings-${id}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("كلمتا المرور الجديدتان غير متطابقتين")
      return
    }
    setSavingPassword(true)
    try {
      const data = await fetchApi<{ message: string }>("/api/specialists/change-password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      })
      toast.success(data.message)
      setPasswords({ current_password: "", new_password: "", confirm_password: "" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر تغيير كلمة المرور")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogoutEverywhere = () => {
    localStorage.removeItem("adhdAssistCurrentUser")
    toast.success("تم تسجيل الخروج من هذا الجهاز.")
  }

  const handleDeleteAccount = () => {
    toast.error("حذف حساب المختص غير مفعّل.")
  }

  const strength = passwordStrength(passwords.new_password)
  const passwordsMatch = Boolean(passwords.confirm_password) && passwords.new_password === passwords.confirm_password
  const passwordsMismatch = Boolean(passwords.confirm_password) && passwords.new_password !== passwords.confirm_password
  const doctorName = profile.full_name || "مختص"

  return (
    <div className="min-w-0">
      <Link href="/orthophoniste" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> العودة للرئيسية
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الملف الشخصي والأمان</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة بيانات حساب المختص وكلمة المرور.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="self-start">
          <nav className="space-y-5">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">الحساب</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => scrollToSection("profile")}
                  className={[
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeNav === "profile"
                      ? "bg-[#EBF5FE] text-[#1a8fe3]"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60",
                  ].join(" ")}
                >
                  <UserCircle2 className="h-4 w-4" />
                  معلومات الملف
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("password")}
                  className={[
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeNav === "password"
                      ? "bg-[#EBF5FE] text-[#1a8fe3]"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60",
                  ].join(" ")}
                >
                  <Lock className="h-4 w-4" />
                  تغيير كلمة المرور
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">التفضيلات</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => scrollToSection("notifications")}
                  className={[
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeNav === "notifications"
                      ? "bg-[#EBF5FE] text-[#1a8fe3]"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60",
                  ].join(" ")}
                >
                  <Bell className="h-4 w-4" />
                  الإشعارات
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("language")}
                  className={[
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeNav === "language"
                      ? "bg-[#EBF5FE] text-[#1a8fe3]"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60",
                  ].join(" ")}
                >
                  <Globe2 className="h-4 w-4" />
                  اللغة والمنطقة
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">منطقة خطرة</p>
              <button
                type="button"
                onClick={() => scrollToSection("danger")}
                className={[
                  "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  activeNav === "danger"
                    ? "bg-red-50 text-red-700"
                    : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20",
                ].join(" ")}
              >
                <TriangleAlert className="h-4 w-4" />
                حذف الحساب
              </button>
            </div>
          </nav>
        </aside>

        <div className="space-y-6">
          <Card id="settings-profile" className="surface-card">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#EBF5FE] flex items-center justify-center">
                  <User className="h-4 w-4 text-[#1a8fe3]" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold">معلومات الملف الشخصي</CardTitle>
                  <p className="text-[11px] text-muted-foreground">حدّث بيانات حساب المختص</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">جاري تحميل الملف الشخصي…</p>
              ) : (
                <form className="space-y-5" onSubmit={handleProfileSave}>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 pb-4 dark:border-slate-700/70">
                    <div className="flex items-center gap-3">
                      <div className="h-[60px] w-[60px] rounded-full bg-[#1a8fe3] text-white flex items-center justify-center text-lg font-semibold">
                        {initialsFromName(doctorName)}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-slate-900 dark:text-white">{doctorName}</p>
                        <p className="text-[12px] text-muted-foreground">مختص</p>
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="border-primary text-primary">
                      <Camera className="h-4 w-4 mr-1" />
                      تغيير الصورة
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">الاسم الكامل</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={savingProfile}>
                    <Check className="h-4 w-4 mr-2" />
                    {savingProfile ? "جاري الحفظ…" : "حفظ التغييرات"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card id="settings-password" className="surface-card">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#EBF5FE] flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-[#1a8fe3]" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold">تغيير كلمة المرور</CardTitle>
                  <p className="text-[11px] text-muted-foreground">حافظ على أمان حسابك بكلمة مرور قوية</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePasswordSave}>
                <div className="grid gap-2">
                  <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current_password}
                      onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new_password}
                      onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="mt-1">
                    <p className="text-[11px] text-muted-foreground mb-1">قوة كلمة المرور</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((lvl) => (
                        <span
                          key={lvl}
                          className={[
                            "h-1.5 rounded",
                            strength.score >= lvl
                              ? strength.score === 1
                                ? "bg-red-500"
                                : strength.score <= 3
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              : "bg-slate-200 dark:bg-slate-700",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">تأكيد كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirm_password}
                      onChange={(e) => setPasswords((p) => ({ ...p, confirm_password: e.target.value }))}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {passwords.confirm_password ? (
                      <span className="absolute right-9 top-1/2 -translate-y-1/2">
                        {passwordsMatch ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </span>
                    ) : null}
                  </div>
                  {passwordsMismatch ? (
                    <p className="text-[11px] text-red-600">كلمتا المرور غير متطابقتين</p>
                  ) : null}
                </div>

                <Button type="submit" variant="outline" disabled={savingPassword} className="bg-white text-slate-900 border-slate-300">
                  {savingPassword ? "جاري التحديث…" : "تحديث كلمة المرور"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card id="settings-notifications" className="surface-card">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#EBF5FE] flex items-center justify-center">
                  <Bell className="h-4 w-4 text-[#1a8fe3]" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold">الإشعارات</CardTitle>
                  <p className="text-[11px] text-muted-foreground">ضبط التنبيهات وإشعارات البريد</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">تفضيلات الإشعارات ستتوفر قريبًا.</p>
            </CardContent>
          </Card>

          <Card id="settings-language" className="surface-card">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#EBF5FE] flex items-center justify-center">
                  <Globe2 className="h-4 w-4 text-[#1a8fe3]" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold">اللغة والمنطقة</CardTitle>
                  <p className="text-[11px] text-muted-foreground">تعيين اللغة الافتراضية والتوطين</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">إعدادات اللغة والمنطقة ستتوفر قريبًا.</p>
            </CardContent>
          </Card>

          <Card id="settings-danger" className="surface-card border-[#fca5a5]">
            <CardHeader className="border-b border-red-100 bg-[#fff5f5]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <TriangleAlert className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold text-red-700">منطقة خطرة</CardTitle>
                  <p className="text-[11px] text-red-600/80">إجراءات لا رجعة فيها — تابع بحذر</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">تسجيل الخروج من كل الأجهزة</p>
                  <p className="text-xs text-muted-foreground mt-1">إلغاء الجلسات الحالية ويتطلب تسجيل دخول جديد.</p>
                </div>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700" onClick={handleLogoutEverywhere}>
                  <LogOut className="h-4 w-4 mr-1.5" />
                  خروج من كل مكان
                </Button>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">حذف الحساب</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    حذف نهائي لحسابك وجميع بيانات المرضى. لا يمكن التراجع عن ذلك.
                  </p>
                </div>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  حذف الحساب
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requiredAccountType="therapist">
      <SettingsPage />
    </AuthGuard>
  )
}
