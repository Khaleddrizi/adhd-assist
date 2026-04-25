"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchApi, type SpecialistLocale } from "@/lib/api"
import { toast } from "sonner"
import { usePortalI18n, notifyLocaleChanged } from "@/lib/i18n/i18n-context"
import { ProfileAvatar } from "@/components/profile-avatar"
import { useProfileAvatarUpload } from "@/hooks/use-profile-avatar-upload"
import {
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
  preferred_locale?: string
  country?: string | null
  state_region?: string | null
  address_line?: string | null
}

type SettingsNavItem = "profile" | "password" | "notifications" | "language" | "danger"

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "DR"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function passwordStrengthScore(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0
  if (password.length < 6) return 1
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  if (password.length >= 8 && hasUpper && hasNumber && hasSpecial) return 4
  if (password.length >= 8 && hasNumber) return 3
  return 2
}

function SettingsPage() {
  const router = useRouter()
  const { t, refreshLocale } = usePortalI18n()
  const avatarMessages = useMemo(
    () => ({
      ok: t("settings.toastPhotoOk"),
      err: t("settings.toastPhotoErr"),
      badType: t("settings.toastPhotoType"),
      tooBig: t("settings.toastPhotoSize"),
    }),
    [t],
  )
  const { version: avatarVersion, uploading: avatarUploading, pickFile: pickAvatar, fileInput: avatarFileInput } =
    useProfileAvatarUpload("/api/specialists/me/avatar", avatarMessages)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)
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
  const [prefs, setPrefs] = useState({
    preferred_locale: "ar" as SpecialistLocale,
    country: "",
    state_region: "",
    address_line: "",
  })
  const [activeNav, setActiveNav] = useState<SettingsNavItem>("profile")

  function syncStoredUser(full_name: string, email: string, preferred_locale?: string) {
    const raw = localStorage.getItem("adhdAssistCurrentUser")
    if (!raw) return
    try {
      const user = JSON.parse(raw)
      user.full_name = full_name
      user.email = email
      if (preferred_locale) user.preferred_locale = preferred_locale
      localStorage.setItem("adhdAssistCurrentUser", JSON.stringify(user))
    } catch {
      //
    }
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchApi<SpecialistProfile>("/api/specialists/me")
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
        })
        const loc = data.preferred_locale === "fr" || data.preferred_locale === "en" ? data.preferred_locale : "ar"
        setPrefs({
          preferred_locale: loc,
          country: data.country || "",
          state_region: data.state_region || "",
          address_line: data.address_line || "",
        })
        syncStoredUser(data.full_name || "", data.email, loc)
        notifyLocaleChanged()
        refreshLocale()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("settings.toastProfileLoad"))
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load profile once on mount
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const data = await fetchApi<SpecialistProfile>("/api/specialists/me", {
        method: "PUT",
        body: JSON.stringify(profile),
      })
      syncStoredUser(data.full_name || "", data.email, data.preferred_locale)
      toast.success(t("settings.toastProfileOk"))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.toastProfileErr"))
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
      toast.error(t("settings.toastPwMismatch"))
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
      toast.error(err instanceof Error ? err.message : t("settings.toastPwErr"))
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogoutEverywhere = () => {
    localStorage.removeItem("adhdAssistCurrentUser")
    toast.success(t("settings.toastLogout"))
  }

  const handlePreferencesSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPrefs(true)
    try {
      const data = await fetchApi<SpecialistProfile>("/api/specialists/me", {
        method: "PUT",
        body: JSON.stringify({
          preferred_locale: prefs.preferred_locale,
          country: prefs.country.trim() || null,
          state_region: prefs.state_region.trim() || null,
          address_line: prefs.address_line.trim() || null,
        }),
      })
      const loc =
        data.preferred_locale === "fr" || data.preferred_locale === "en" ? data.preferred_locale : "ar"
      setPrefs((p) => ({
        ...p,
        preferred_locale: loc,
        country: data.country || "",
        state_region: data.state_region || "",
        address_line: data.address_line || "",
      }))
      syncStoredUser(profile.full_name, profile.email, loc)
      notifyLocaleChanged()
      refreshLocale()
      toast.success(t("settings.toastPrefsOk"))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.toastPrefsErr"))
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error(t("settings.toastDeletePw"))
      return
    }
    setDeletingAccount(true)
    try {
      await fetchApi<{ message: string }>("/api/specialists/me", {
        method: "DELETE",
        body: JSON.stringify({ current_password: deletePassword }),
      })
      localStorage.removeItem("adhdAssistCurrentUser")
      toast.success(t("settings.toastDeleteOk"))
      setDeleteOpen(false)
      setDeletePassword("")
      router.push("/login?role=therapist")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.toastDeleteErr"))
    } finally {
      setDeletingAccount(false)
    }
  }

  const strengthScore = passwordStrengthScore(passwords.new_password)
  const pwStrengthKeys = ["settings.pwEmpty", "settings.pwWeak", "settings.pwFair", "settings.pwGood", "settings.pwStrong"] as const
  const passwordsMatch = Boolean(passwords.confirm_password) && passwords.new_password === passwords.confirm_password
  const passwordsMismatch = Boolean(passwords.confirm_password) && passwords.new_password !== passwords.confirm_password
  const doctorName = profile.full_name || t("common.specialist")

  return (
    <div className="min-w-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("settings.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.pageHint")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="self-start">
          <nav className="space-y-5">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{t("settings.navAccount")}</p>
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
                  {t("settings.navProfile")}
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
                  {t("settings.navPassword")}
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{t("settings.navPrefs")}</p>
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
                  {t("settings.navNotifications")}
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
                  {t("settings.navLanguage")}
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{t("settings.navDanger")}</p>
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
                {t("settings.navDelete")}
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
                  <CardTitle className="text-[14px] font-bold">{t("settings.profileCardTitle")}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t("settings.profileCardHint")}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">{t("settings.profileLoading")}</p>
              ) : (
                <form className="space-y-5" onSubmit={handleProfileSave}>
                  {avatarFileInput}
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 pb-4 dark:border-slate-700/70">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        apiPath="/api/specialists/me/avatar"
                        initials={initialsFromName(doctorName)}
                        version={avatarVersion}
                        className="h-[60px] w-[60px] rounded-full bg-[#1a8fe3] text-white text-lg border-2 border-slate-200/80 dark:border-slate-600"
                      />
                      <div>
                        <p className="text-[15px] font-bold text-slate-900 dark:text-white">{doctorName}</p>
                        <p className="text-[12px] text-muted-foreground">{t("common.specialist")}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary"
                      onClick={pickAvatar}
                      disabled={avatarUploading}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      {avatarUploading ? t("common.saving") : t("settings.changePhoto")}
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">{t("settings.fullName")}</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">{t("settings.phone")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("settings.email")}</Label>
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
                    {savingProfile ? t("common.saving") : t("settings.saveChanges")}
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
                  <CardTitle className="text-[14px] font-bold">{t("settings.passwordTitle")}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t("settings.passwordHint")}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePasswordSave}>
                <div className="grid gap-2">
                  <Label htmlFor="current_password">{t("settings.currentPassword")}</Label>
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
                  <Label htmlFor="new_password">{t("settings.newPassword")}</Label>
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
                    <p className="text-xs text-muted-foreground mb-1">{t("settings.pwStrength")}</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((lvl) => (
                        <span
                          key={lvl}
                          className={[
                            "h-1.5 rounded",
                            strengthScore >= lvl
                              ? strengthScore === 1
                                ? "bg-red-500"
                                : strengthScore <= 3
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              : "bg-slate-200 dark:bg-slate-700",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t(pwStrengthKeys[strengthScore])}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">{t("settings.confirmPassword")}</Label>
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
                    <p className="text-xs text-red-600">{t("settings.pwMismatch")}</p>
                  ) : null}
                </div>

                <Button type="submit" variant="outline" disabled={savingPassword} className="bg-white text-slate-900 border-slate-300">
                  {savingPassword ? t("settings.updating") : t("settings.updatePassword")}
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
                  <CardTitle className="text-[14px] font-bold">{t("settings.notificationsTitle")}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t("settings.notificationsHint")}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("settings.notificationsSoon")}</p>
            </CardContent>
          </Card>

          <Card id="settings-language" className="surface-card">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#EBF5FE] flex items-center justify-center">
                  <Globe2 className="h-4 w-4 text-[#1a8fe3]" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold">{t("settings.langTitle")}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t("settings.langHint")}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePreferencesSave}>
                <div className="grid gap-2">
                  <Label htmlFor="preferred_locale">{t("settings.langUi")}</Label>
                  <Select
                    value={prefs.preferred_locale}
                    onValueChange={(v) => setPrefs((p) => ({ ...p, preferred_locale: v as SpecialistLocale }))}
                  >
                    <SelectTrigger id="preferred_locale" className="max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">{t("settings.langAr")}</SelectItem>
                      <SelectItem value="fr">{t("settings.langFr")}</SelectItem>
                      <SelectItem value="en">{t("settings.langEn")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">{t("settings.langNote")}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="country">{t("settings.country")}</Label>
                    <Input
                      id="country"
                      value={prefs.country}
                      onChange={(e) => setPrefs((p) => ({ ...p, country: e.target.value }))}
                      placeholder={t("settings.countryPh")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state_region">{t("settings.region")}</Label>
                    <Input
                      id="state_region"
                      value={prefs.state_region}
                      onChange={(e) => setPrefs((p) => ({ ...p, state_region: e.target.value }))}
                      placeholder={t("settings.regionPh")}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address_line">{t("settings.address")}</Label>
                  <Textarea
                    id="address_line"
                    rows={3}
                    value={prefs.address_line}
                    onChange={(e) => setPrefs((p) => ({ ...p, address_line: e.target.value }))}
                    placeholder={t("settings.addressPh")}
                    className="resize-y min-h-[80px]"
                  />
                </div>
                <Button type="submit" disabled={savingPrefs}>
                  <Check className="h-4 w-4 mr-2" />
                  {savingPrefs ? t("common.saving") : t("settings.saveLang")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card id="settings-danger" className="surface-card border-[#fca5a5]">
            <CardHeader className="border-b border-red-100 bg-[#fff5f5]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <TriangleAlert className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold text-red-700">{t("settings.dangerTitle")}</CardTitle>
                  <p className="text-sm text-red-600/80">{t("settings.dangerHint")}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t("settings.logoutAll")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("settings.logoutAllHint")}</p>
                </div>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700" onClick={handleLogoutEverywhere}>
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {t("settings.logoutAllBtn")}
                </Button>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t("settings.deleteTitle")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("settings.deleteHint")}</p>
                </div>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" type="button" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  {t("settings.deleteBtn")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.deleteDialogTitle")}</DialogTitle>
            <DialogDescription>{t("settings.deleteDialogHint")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="delete_password">{t("settings.deletePw")}</Label>
            <Input
              id="delete_password"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t("settings.deletePwPh")}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={deletingAccount}>
              {t("common.cancel")}
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700" disabled={deletingAccount} onClick={handleDeleteAccount}>
              {deletingAccount ? t("settings.deleteDeleting") : t("settings.deleteConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
