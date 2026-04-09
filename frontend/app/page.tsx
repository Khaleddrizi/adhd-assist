"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowRight, Users, FileText, Brain, BarChart3, ClipboardCheck, Gamepad2, Heart, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    const animatedElements = document.querySelectorAll(".animate-on-scroll")
    animatedElements.forEach((el) => observer.observe(el))

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col" ref={containerRef}>
      <SiteHeader />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="bg-gradient-to-b from-background to-sky-50 dark:from-background dark:to-sky-950/10 pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="container grid items-center gap-6 pt-6 md:py-10 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-4 animate-on-scroll">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Solution innovante pour l&apos;ADHD
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-500 to-teal-500">
                ADHD Assist — Interventions personnalisées grâce aux assistants vocaux et à l'IA générative
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Une solution digitale innovante qui met en place des systèmes intelligents de soutien au comportement,
                adaptés aux enfants et adultes atteints d'un Trouble du Déficit de l'Attention avec ou sans
                Hyperactivité (ADHD – Attention Deficit Hyperactivity Disorder), afin de favoriser la concentration,
                l'attention et l'autonomie au quotidien.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="px-8 gap-2 group bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 transition-all duration-300"
                  >
                    Login
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                  >
                    Create Professional Account
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <svg className="h-4 w-4 fill-current text-teal-500" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Essai gratuit de 7 jours</span>
                <span className="mx-2">•</span>
                <svg className="h-4 w-4 fill-current text-teal-500" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Aucune carte de crédit requise</span>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end animate-on-scroll">
              <div className="relative">
                <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-r from-sky-300/30 to-cyan-300/30 blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-gradient-to-r from-blue-300/30 to-teal-300/30 blur-3xl animate-pulse-slow" />
                <div className="relative z-10">
                  <Image
                    src="/enfant-assistant-vocal.png"
                    alt="Enfant avec assistant cognitif"
                    width={500}
                    height={400}
                    className="rounded-lg shadow-xl"
                    priority
                  />
                  <div className="absolute -top-10 -right-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg animate-bounce-slow border-2 border-primary/20">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute -bottom-5 -left-5 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg animate-float border-2 border-cyan-500/20">
                    <Target className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Fonctionnalités principales */}
        <section className="py-16 bg-gradient-to-b from-sky-50 to-background dark:from-sky-950/10 dark:to-background">
          <div className="container">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
                Fonctionnalités principales de la plateforme
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                Notre solution propose des outils modernes pour accompagner la rééducation des personnes atteintes
                d'ADHD, et les aider à développer leurs capacités ainsi que leur confiance.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="animate-on-scroll lg:col-span-2 md:col-span-2">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-sky-50 dark:from-gray-900 dark:to-sky-950/20 h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 p-3 transition-all duration-300 group-hover:scale-110">
                          <ClipboardCheck className="h-8 w-8 text-sky-600" />
                        </div>
                        <h3 className="text-xl font-bold">1. Évaluation et suivi personnalisé</h3>
                      </div>
                      <ul className="space-y-3 text-muted-foreground ml-14">
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-sky-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Évaluation initiale du niveau de l&apos;enfant/adulte</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-sky-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Génération de rapports détaillés et statistiques de progression</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-sky-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Adaptation continue des exercices en fonction des besoins identifiés</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-on-scroll">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20 h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-3 transition-all duration-300 group-hover:scale-110">
                          <Brain className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold">2. Génération et analyse de quiz</h3>
                      </div>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Création automatique de quiz à partir de documents fournis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Analyse des réponses pour identifier les points forts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Adaptation des prochains exercices selon les performances</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-on-scroll">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-teal-50 dark:from-gray-900 dark:to-teal-950/20 h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 p-3 transition-all duration-300 group-hover:scale-110">
                          <Gamepad2 className="h-8 w-8 text-teal-600" />
                        </div>
                        <h3 className="text-xl font-bold">3. Exercices ludiques et interactifs</h3>
                      </div>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-teal-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>
                            Jeux éducatifs pour renforcer la prononciation, la compréhension et le vocabulaire
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-teal-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Activités interactives pour stimuler l&apos;attention et la mémoire</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-on-scroll">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-950/20 h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3 transition-all duration-300 group-hover:scale-110">
                          <Users className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold">4. Suivi pour parents et professionnels</h3>
                      </div>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-indigo-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Tableau de bord dédié aux parents pour suivre les progrès</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-indigo-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Espace professionnel pour personnaliser les contenus et adapter les niveaux</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-on-scroll">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-pink-50 dark:from-gray-900 dark:to-pink-950/20 h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 p-3 transition-all duration-300 group-hover:scale-110">
                          <Heart className="h-8 w-8 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-bold">5. Motivation et encouragements</h3>
                      </div>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-pink-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>L&apos;assistant vocal félicite et encourage après chaque réussite</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="h-4 w-4 text-pink-600 mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Maintien de l&apos;engagement grâce à un feedback positif et régulier</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Fonctionnement en 3 étapes */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
                Fonctionnement en 3 étapes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Une approche simple et efficace pour transformer l&apos;accompagnement ADHD.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 relative">
              <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block" />
              <div className="relative flex flex-col items-center text-center animate-on-scroll">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white w-10 h-10 flex items-center justify-center font-bold shadow-lg z-10">
                  1
                </div>
                <div className="rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-900/20 dark:to-cyan-900/20 p-6 mb-4 shadow-md hover:scale-105 transition-transform duration-300">
                  <FileText className="h-12 w-12 text-sky-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Évaluation</h3>
                <p className="text-muted-foreground">
                  Le professionnel évalue les besoins spécifiques de l&apos;enfant et configure son profil.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center animate-on-scroll">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-10 h-10 flex items-center justify-center font-bold shadow-lg z-10">
                  2
                </div>
                <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 mb-4 shadow-md hover:scale-105 transition-transform duration-300">
                  <Brain className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Entraînement</h3>
                <p className="text-muted-foreground">
                  L&apos;IA génère des exercices personnalisés pour développer les capacités cognitives.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center animate-on-scroll">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-10 h-10 flex items-center justify-center font-bold shadow-lg z-10">
                  3
                </div>
                <div className="rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 mb-4 shadow-md hover:scale-105 transition-transform duration-300">
                  <BarChart3 className="h-12 w-12 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Suivi</h3>
                <p className="text-muted-foreground">
                  Les progrès sont analysés et partagés avec les parents et professionnels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Pour qui est cette plateforme ? */}
        <section className="py-16 bg-gradient-to-b from-background to-blue-50/50 dark:from-background dark:to-blue-950/10">
          <div className="container">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                Pour qui est cette plateforme ?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                ADHD Assist s&apos;adresse à tous les acteurs impliqués dans l&apos;accompagnement ADHD.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="animate-on-scroll">
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20 border-none shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="hover:rotate-6 transition-transform duration-300">
                        <Image
                          src="/orthophoniste-professional.png"
                          alt="Orthophoniste en séance"
                          width={80}
                          height={80}
                          className="rounded-full border-4 border-blue-100 dark:border-blue-900/30 shadow-md"
                        />
                      </div>
                      <h3 className="text-xl font-bold">Orthophonistes</h3>
                      <p className="text-muted-foreground">
                        Spécialistes de la rééducation, proposant des programmes adaptés aux personnes avec ADHD.
                      </p>
                      <ul className="text-sm text-left space-y-2">
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Suivi de multiples patients
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Programmes personnalisés
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Analyse détaillée des progrès
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-on-scroll">
                <Card className="bg-gradient-to-br from-white to-sky-50 dark:from-gray-900 dark:to-sky-950/20 border-none shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="hover:-rotate-6 transition-transform duration-300">
                        <Image
                          src="/parents-icon.png"
                          alt="Parents"
                          width={80}
                          height={80}
                          className="rounded-full border-4 border-sky-100 dark:border-sky-900/30 shadow-md"
                        />
                      </div>
                      <h3 className="text-xl font-bold">Parents</h3>
                      <p className="text-muted-foreground">
                        Accompagner, comprendre et suivre les progrès depuis la maison.
                      </p>
                      <ul className="text-sm text-left space-y-2">
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Participation active à l&apos;accompagnement
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Suivi des progrès en temps réel
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Communication avec les professionnels
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-on-scroll">
                <Card className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-900 dark:to-cyan-950/20 border-none shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="hover:rotate-6 transition-transform duration-300">
                        <Image
                          src="/happy-child-icon.png"
                          alt="Enfants"
                          width={80}
                          height={80}
                          className="rounded-full border-4 border-cyan-100 dark:border-cyan-900/30 shadow-md"
                        />
                      </div>
                      <h3 className="text-xl font-bold">Enfants avec ADHD</h3>
                      <p className="text-muted-foreground">
                        Développer ses capacités en s&apos;amusant avec des exercices adaptés et motivants.
                      </p>
                      <ul className="text-sm text-left space-y-2">
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Exercices ludiques et interactifs
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Feedback positif et encourageant
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Progression adaptée à leur rythme
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Appel final */}
        <section className="py-16 bg-gradient-to-r from-primary to-cyan-500 text-white relative overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-pulse-slow" />
          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6 animate-on-scroll">
              <h2 className="text-3xl font-bold">Rejoignez la nouvelle génération de l&apos;accompagnement ADHD</h2>
              <p className="text-white/90 text-lg">
                Transformez votre approche thérapeutique et offrez une expérience engageante aux enfants avec ADHD.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="min-w-[240px] bg-white text-primary hover:bg-white/90 transition-all duration-300 hover:scale-105"
                  >
                    Create Professional Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-w-[200px] text-white border-white hover:bg-white hover:text-primary transition-all duration-300 bg-transparent hover:scale-105"
                  >
                    Login
                  </Button>
                </Link>
              </div>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Aucune carte de crédit requise. Annulez à tout moment.
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 160"
              className="w-full h-24 md:h-32 fill-white/90 dark:fill-gray-950/90"
              preserveAspectRatio="none"
            >
              <path
                d="M0,96L48,90.7C96,85,192,75,288,80C384,85,480,107,576,112C672,117,768,107,864,96C960,85,1056,75,1152,80C1248,85,1344,107,1392,117.3L1440,128L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z"
              />
            </svg>
          </div>
        </section>

        {/* Floating elements */}
        <div className="fixed bottom-10 right-10 z-50 hidden md:block">
          <div className="bg-gradient-to-r from-primary to-cyan-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300 border-2 border-white/20">
            <Brain className="h-6 w-6" />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
