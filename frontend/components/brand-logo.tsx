"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoSize = "sm" | "md" | "lg"

const sizeClass: Record<BrandLogoSize, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-11",
}

type BrandLogoProps = {
  size?: BrandLogoSize
  className?: string
  priority?: boolean
}

export function BrandLogo({ size = "md", className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/atheeria-logo.png"
      alt="Atheeria"
      width={170}
      height={52}
      priority={priority}
      className={cn(
        "w-auto object-contain",
        "drop-shadow-[0_2px_4px_rgba(22,163,211,0.16)] dark:drop-shadow-[0_2px_5px_rgba(14,116,144,0.35)]",
        sizeClass[size],
        className,
      )}
    />
  )
}
