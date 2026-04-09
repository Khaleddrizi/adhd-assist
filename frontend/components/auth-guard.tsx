"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  requiredAccountType?: "therapist" | "parent" | "administration"
}

export function AuthGuard({ children, requiredAccountType }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = localStorage.getItem("adhdAssistCurrentUser")

        if (!currentUser) {
          router.push("/login")
          return
        }

        const user = JSON.parse(currentUser)
        const accountType =
          user.accountType || (user.role === "specialist" ? "therapist" : user.role === "administration" ? "administration" : "parent")

        // accountType: therapist (specialist) | parent
        if (requiredAccountType && accountType !== requiredAccountType) {
          if (accountType === "therapist") {
            router.push("/orthophoniste")
          } else if (accountType === "administration") {
            router.push("/administration")
          } else {
            router.push("/dashboard")
          }
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Erreur d'authentification:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredAccountType])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
