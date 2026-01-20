"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "./ui/Button";

export function Navbar() {
    const { language, translations: t, changeLanguage, isLoading } = useLanguage();
    const [showLangMenu, setShowLangMenu] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <div className="relative w-40 h-10">
                            <Image
                                src="/logos.png"
                                alt="Shealth AI Logo"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
                    {/* <a href="#" className="hover:text-slate-800 transition-colors">{t.nav.features}</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">{t.nav.solutions}</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">{t.nav.about}</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">{t.nav.contact}</a> */}
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Dropdown */}
                    <div className="relative" ref={langMenuRef}>
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className={`p-2 rounded-xl transition-all ${language !== 'en' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            title="Change Language"
                        >
                            <Globe className="w-5 h-5" />
                        </button>

                        {showLangMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { changeLanguage('en'); setShowLangMenu(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${language === 'en' ? 'font-bold text-[var(--color-primary)]' : 'text-slate-600'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => { changeLanguage('es'); setShowLangMenu(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${language === 'es' ? 'font-bold text-[var(--color-primary)]' : 'text-slate-600'}`}
                                >
                                    Español {isLoading && language !== 'es' && '...'}
                                </button>
                            </div>
                        )}
                    </div>
                    <Link href="/login">
                        <Button variant="outline" size="sm" className="font-semibold">
                            {t.nav.login}
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="font-semibold shadow-md shadow-[var(--color-primary)]/20">
                            {t.nav.signup}
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
