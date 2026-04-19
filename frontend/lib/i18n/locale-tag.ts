import type { AppLocale } from "./types"

/** BCP 47 tag for `Intl` / `toLocaleDateString`. */
export function localeTag(loc: AppLocale): string {
  if (loc === "ar") return "ar-SA"
  if (loc === "fr") return "fr-FR"
  return "en-US"
}
