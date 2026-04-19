"use client"

import { PortalI18nProvider } from "@/lib/i18n/i18n-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LandingPageMain } from "@/components/landing-page-main"

export default function LandingPage() {
  return (
    <PortalI18nProvider role="public">
      <div className="flex min-h-screen flex-col">
        <SiteHeader variant="marketing" />
        <LandingPageMain />
        <SiteFooter />
      </div>
    </PortalI18nProvider>
  )
}
