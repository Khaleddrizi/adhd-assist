"use client"

import { useCallback, useRef, useState } from "react"
import { getAuthHeaders, publicApiBase } from "@/lib/api"
import { toast } from "sonner"

export type AvatarUploadMessages = {
  ok: string
  err: string
  badType: string
  tooBig: string
}

export function useProfileAvatarUpload(apiPath: string, messages: AvatarUploadMessages) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [version, setVersion] = useState(0)
  const [uploading, setUploading] = useState(false)

  const pickFile = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        toast.error(messages.badType)
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(messages.tooBig)
        return
      }
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch(`${publicApiBase}${apiPath}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: fd,
          credentials: "include",
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error((body as { error?: string }).error || messages.err)
        toast.success(messages.ok)
        setVersion((v) => v + 1)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : messages.err)
      } finally {
        setUploading(false)
      }
    },
    [apiPath, messages],
  )

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={onFileChange}
    />
  )

  return { version, uploading, pickFile, fileInput }
}
