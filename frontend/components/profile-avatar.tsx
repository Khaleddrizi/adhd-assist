"use client"

import { useEffect, useState } from "react"
import { getAuthHeaders, publicApiBase } from "@/lib/api"
import { cn } from "@/lib/utils"

type Props = {
  /** e.g. `/api/specialists/me/avatar` */
  apiPath: string
  initials: string
  className?: string
  /** Bump after upload to refetch image */
  version?: number
}

export function ProfileAvatar({ apiPath, initials, className, version = 0 }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    ;(async () => {
      try {
        const res = await fetch(`${publicApiBase}${apiPath}`, {
          headers: getAuthHeaders(),
          credentials: "include",
        })
        if (!res.ok || cancelled) return
        const blob = await res.blob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      } catch {
        //
      }
    })()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [apiPath, version])

  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={cn("rounded-full object-cover shrink-0", className)}
      />
    )
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}
