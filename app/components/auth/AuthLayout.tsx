"use client";

import React from "react";
import { Activity } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const { translations: t } = useLanguage();
    return (
        <div className="min-h-screen w-full flex">
            {/* Visual Side (Left) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[var(--color-primary)] to-[#0f172a] relative overflow-hidden items-center justify-center text-white p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 max-w-lg">
                    {/* <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30 animate-in zoom-in duration-700">
                        <Activity className="w-8 h-8 text-white" />
                    </div> */}
                    <h1 className="text-5xl font-bold mb-6 leading-tight animate-in slide-in-from-bottom-5 duration-700 delay-100">
                        {t.auth.layout.heroTitle1} <br />
                        <span className="text-[var(--color-accent)]">{t.auth.layout.heroTitle2}</span>
                    </h1>
                    <p className="text-lg text-slate-200 leading-relaxed opacity-90 animate-in slide-in-from-bottom-5 duration-700 delay-200">
                        {t.auth.layout.heroDesc}
                    </p>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--color-accent)]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Form Side (Right) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 relative p-8">
                {/* <div className="absolute top-0 right-0 p-8">
                    <span className="text-sm font-medium text-slate-500">Need help?</span>
                </div> */}

                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-8 lg:hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">Shealth AI</span>
                        </div>
                        <p className="text-slate-500">{t.auth.layout.mobileSubtitle}</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-3xl p-8 sm:p-12">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                            <p className="text-slate-500 mt-2">{subtitle}</p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
