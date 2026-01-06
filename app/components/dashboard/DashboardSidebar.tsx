"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/app/services/authService";
import Image from "next/image";
import {
    LayoutDashboard,
    Upload,
    History,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
} from "lucide-react";

interface DashboardSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Upload, label: "Upload", href: "/dashboard/upload" },
    { icon: History, label: "History", href: "/dashboard/history" },
    { icon: BarChart3, label: "Statistics", href: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function DashboardSidebar({ isCollapsed, onToggle }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    return (
        <aside
            className={`
                fixed top-0 left-0 z-40 h-screen
                bg-indigo-900
                border-r border-slate-800/50
                transition-all duration-300 ease-in-out
                flex flex-col
                ${isCollapsed ? "w-20" : "w-72"}
            `}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-center border-b border-slate-800/50">
                <Link href="/" className="flex items-center gap-3 overflow-hidden">
                    {isCollapsed ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                    ) : (
                        <div className="w-40 h-16 relative flex-shrink-0">
                            <Image
                                src="/logos.png"
                                alt="Shealth AI"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href === "/dashboard" && pathname === "/dashboard");

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl
                                        transition-all duration-200 group relative
                                        ${isActive
                                            ? "bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-accent)]/10 text-white shadow-lg shadow-cyan-500/5"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                        }
                                    `}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)]" />
                                    )}

                                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? "text-[var(--color-accent)]" : "group-hover:scale-110"}`} />

                                    <span
                                        className={`
                                            font-medium whitespace-nowrap
                                            transition-all duration-300
                                            ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
                                        `}
                                    >
                                        {item.label}
                                    </span>

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                                            {item.label}
                                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                                        </div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-24 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 shadow-lg z-50"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>

            {/* User Section */}
            <div className="p-4 border-t border-slate-800/50">
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-700">
                        <User className="w-5 h-5 text-slate-300" />
                    </div>
                    <div
                        className={`
                            transition-all duration-300 overflow-hidden
                            ${isCollapsed ? "opacity-0 w-0" : "opacity-100 flex-1"}
                        `}
                    >
                        <p className="text-sm font-semibold text-white truncate">Dr. Harshal</p>
                        <p className="text-xs text-slate-500 truncate">Radiologist</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`
                            p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg
                            transition-all duration-200
                            ${isCollapsed ? "hidden" : ""}
                        `}
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
