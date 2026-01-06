"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { PatientsTable } from "../components/dashboard/PatientsTable";
import { Sparkles, Shield, Zap, Upload, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function DashboardPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Sidebar */}
            <DashboardSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div
                className={`
                    transition-all duration-300 ease-in-out
                    ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
                `}
            >
                {/* Header */}
                <DashboardHeader
                    onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    title="Dashboard"
                    subtitle="Overview of your medical imaging workspace"
                />

                {/* Main Content */}
                <main className="p-6 lg:p-8">
                    {/* Welcome Section */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">Dr. Harshal</span>
                            </h1>
                            <p className="text-slate-500">
                                Here's an overview of your recent activity and patient scans.
                            </p>
                        </div>
                        {/* <Link href="/dashboard/upload">
                            <Button className="shadow-lg">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload New Scan
                            </Button>
                        </Link> */}
                    </div>


                    {/* Quick Upload Card */}
                    <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Ready to analyze a new scan?</h3>
                                <p className="text-white/80 text-sm">Upload XRAY, MRI, or CT scans and get AI-powered insights in seconds.</p>
                            </div>
                            <Link href="/dashboard/upload">
                                <button className="flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-primary)] font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg">
                                    Go to Upload
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Patients Table */}
                    <PatientsTable />
                </main>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    change,
    gradient,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change: string;
    gradient: string;
}) {
    const isPositive = change.startsWith("+") || (change.startsWith("-") && label === "Avg. Time");

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}>
                    {change}
                </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    );
}
