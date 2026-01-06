"use client";

import React from "react";
import { Search, Bell, Menu, ChevronRight } from "lucide-react";

interface DashboardHeaderProps {
    onMenuToggle: () => void;
    title?: string;
    subtitle?: string;
}

export function DashboardHeader({ onMenuToggle, title = "Dashboard", subtitle }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100">
            <div className="h-full px-6 flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Breadcrumb / Title */}
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-0.5">
                            <span className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Home</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-slate-700 font-medium">{title}</span>
                        </div>
                        {subtitle && (
                            <p className="text-xs text-slate-400">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Center Section - Search */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search patients, scans, reports..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-medium text-slate-400">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Quick Actions */}
                    <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                        <Bell className="w-5 h-5" />
                        {/* Notification Dot */}
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    </button>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-8 bg-slate-200" />

                    {/* Status Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">AI Ready</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
