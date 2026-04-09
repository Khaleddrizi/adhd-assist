"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Activity, Users, BarChart3, Upload, Settings, LogOut } from "lucide-react"

export default function OrthophonisteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<{ full_name?: string; email?: string } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("adhdAssistCurrentUser")
      if (!raw) return
      setCurrentUser(JSON.parse(raw))
    } catch {
      //
    }
  }, [])

  const displayName = currentUser?.full_name || currentUser?.email || "Doctor"

  const nav = useMemo(
    () => [
      { href: "/orthophoniste", label: "Dashboard", icon: Activity },
      { href: "/orthophoniste/patients", label: "Patients", icon: Users },
      { href: "/orthophoniste/analytics", label: "Clinical Analytics", icon: BarChart3 },
      { href: "/orthophoniste/library", label: "Library", icon: Upload },
      { href: "/orthophoniste/settings", label: "Settings", icon: Settings },
    ],
    [],
  )

  const handleLogout = () => {
    localStorage.removeItem("adhdAssistCurrentUser")
    router.replace("/")
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/60 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <aside className="w-64 border-r border-border/60 bg-white/90 dark:bg-slate-900/70 shadow-lg backdrop-blur flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/adhd-logo.png" alt="ADHD Assist" width={32} height={32} className="rounded-md" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
              ADHD Assist
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/orthophoniste" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "border-l-[3px] border-primary bg-blue-50/80 text-slate-900 dark:bg-slate-800/40 dark:text-white"
                    : "hover:bg-slate-100/70 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  )
}

