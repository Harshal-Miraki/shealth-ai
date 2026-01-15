"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./components/ui/Button";
import { Activity, Brain, Shield, Zap, ArrowRight, CheckCircle2, ChevronRight, BarChart3, Lock } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { useLanguage } from "./context/LanguageContext";

export default function Home() {
  const { translations: t } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--color-background)] selection:bg-[var(--color-primary)] selection:text-white overflow-x-hidden font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 lg:pt-1 lg:pb-32 px-6 overflow-hidden">
        {/* Technical Grid Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-[var(--color-primary)]/10 to-transparent rounded-full blur-3xl mix-blend-multiply -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[var(--color-accent)]/10 to-transparent rounded-full blur-3xl mix-blend-multiply translate-y-1/3 -translate-x-1/3"></div>
        </div>

        <div className="container mx-auto relative z-10 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Text Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-surface)] border border-slate-200 rounded-full mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]"></span>
                </span>
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">{t.landing.badge}</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                {t.landing.heroTitle1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
                  {t.landing.heroTitle2}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                {t.landing.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 transition-shadow">
                    {t.landing.requestDemo} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-base hover:bg-[var(--color-surface)] border-slate-300">
                    {t.landing.providerSignIn}
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-x-8 gap-y-4 flex-wrap text-sm font-medium text-slate-500 animate-in fade-in duration-1000 delay-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--color-primary)]" />
                  {t.landing.soc2}
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--color-primary)]" />
                  {t.landing.hipaa}
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--color-primary)]" />
                  {t.landing.uptime}
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="w-full lg:w-1/2 relative perspective-1000 animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="relative z-10 transform lg:rotate-y-[-5deg] lg:rotate-x-[2deg] transition-transform duration-500 hover:rotate-0">
                <div className="rounded-xs overflow-hidden shadow-2xl border-[4px] border-slate-900/5 bg-slate-900">
                  {/* Using a relative wrapper for Next/Image to ensure aspect ratio */}
                  <div className="relative aspect-[16/10]">
                    <Image
                      src="/shelth_dashboard_hero.png" // We will need to correct this path or use the generated image file name
                      alt="Shealth AI Clinical Dashboard"
                      fill
                      className="object-cover"
                    />

                    {/* Overlay Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/20 to-transparent pointer-events-none mix-blend-overlay"></div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow hidden md:flex">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{t.landing.analysisComplete}</p>
                    <p className="font-bold text-slate-800">{t.landing.noAnomalies}</p>
                  </div>
                </div>
              </div>

              {/* Decorative elements behind image */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[var(--color-primary)]/20 via-[var(--color-accent)]/20 to-transparent blur-3xl rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Logos Section (Optional Placeholder) */}
      {/* <section className="py-10 border-y border-slate-100 bg-[var(--color-surface)]">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by leading institutions</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholders for logos */}
      {/* <div className="h-8 w-32 bg-slate-300/50 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-slate-300/50 rounded animate-pulse delay-100"></div>
            <div className="h-8 w-32 bg-slate-300/50 rounded animate-pulse delay-200"></div>
            <div className="h-8 w-32 bg-slate-300/50 rounded animate-pulse delay-300"></div>
          </div>
        </div> */}
      {/* </section> */}

      {/* Features Grid */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              {t.landing.intelligenceIntegrated}
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              {t.landing.intelligenceDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-white" />}
              title={t.landing.features.neuralAnalysis}
              description={t.landing.features.neuralDesc}
              gradient="bg-gradient-to-br from-[var(--color-primary)] to-blue-600"
              ctaText={t.landing.learnMore}
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8 text-white" />}
              title={t.landing.features.predictiveAnalytics}
              description={t.landing.features.predictiveDesc}
              gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
              ctaText={t.landing.learnMore}
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-white" />}
              title={t.landing.features.realTimeTriage}
              description={t.landing.features.triageDesc}
              gradient="bg-gradient-to-br from-[var(--color-accent)] to-teal-500"
              ctaText={t.landing.learnMore}
            />
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Shealth AI</span>
              </div>
              <p className="max-w-xs text-slate-500 leading-relaxed">
                Pioneering the intersection of artificial intelligence and medical diagnostics to save lives and improve patient outcomes globally.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">{t.nav.platform}</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">{t.nav.features}</a></li>
                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">{t.nav.integrations}</a></li>
                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">{t.nav.security}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">{t.nav.company}</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">{t.nav.about}</a></li>
                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">{t.nav.careers}</a></li>
                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">{t.nav.contact}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>{t.landing.copyright}</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">{t.nav.privacy}</a>
              <a href="#" className="hover:text-white transition-colors">{t.nav.terms}</a>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}

function FeatureCard({ icon, title, description, gradient, ctaText = "Learn more" }: { icon: React.ReactNode, title: string, description: string, gradient: string, ctaText?: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 ${gradient}`}>
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>

      <div className="mt-8 flex items-center text-[var(--color-primary)] font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        {ctaText} <ChevronRight className="ml-1 w-4 h-4" />
      </div>

      {/* Background Decoration */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-[var(--color-surface)] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}
