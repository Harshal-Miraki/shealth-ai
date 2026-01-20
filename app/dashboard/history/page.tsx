"use client";

import React, { useState, useEffect } from "react";
import {
    History,
    Search,
    Filter,
    FileText,
    Upload,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    Download,
    Eye
} from "lucide-react";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { getAllDiagnoses } from "../../services/aiDiagnosisService";
import { useLanguage } from "../../context/LanguageContext";

// Activity Log Type
interface ActivityLog {
    id: string;
    action: string;
    details: string;
    type: string;
    timestamp: string;
    user: string;
    reportGeneratedAt?: string;
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
    upload: <Upload className="w-4 h-4" />,
    analysis: <Activity className="w-4 h-4" />,
    report: <FileText className="w-4 h-4" />,
    security: <Activity className="w-4 h-4" />, // Reusing Activity for security generic or use User/Lock
    export: <Download className="w-4 h-4" />,
    view: <Eye className="w-4 h-4" />,
    system: <Activity className="w-4 h-4" />
};

const STATUS_STYLES: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function HistoryPage() {
    const { translations: t } = useLanguage();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    // Load diagnoses from localStorage and convert to activity logs
    useEffect(() => {
        const diagnoses = getAllDiagnoses();

        // Transform diagnoses into activity logs
        const logs: ActivityLog[] = [];

        diagnoses.forEach((diagnosis) => {
            // Add upload activity
            logs.push({
                id: `upload-${diagnosis.id}`,
                action: "DICOM Upload",
                details: `${diagnosis.patient.scanType} scan uploaded for ${diagnosis.patient.name}`,
                type: "upload",
                timestamp: diagnosis.patient.scanDate,
                user: diagnosis.patient.name || "Unknown",
                reportGeneratedAt: diagnosis.aiReport?.generatedAt
            });

        });

        // Sort by timestamp descending (most recent first)
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setActivityLogs(logs);
    }, []);

    // Filter logs based on search
    const filteredLogs = activityLogs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
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
                    title={t.dashboard.history.title}
                    subtitle={t.dashboard.history.subtitle}
                />

                <main className="p-6 lg:p-8 space-y-8">
                    {/* Header Section Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-xl font-bold text-slate-900">{t.dashboard.history.header}</h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (filteredLogs.length === 0) return;
                                    const csvContent = "data:text/csv;charset=utf-8,"
                                        + ["ID,Action,User,Details,Type,Timestamp,Report Generated"].join(",") + "\n"
                                        + filteredLogs.map(log =>
                                            [log.id, log.action, log.user, `"${log.details}"`, log.type, log.timestamp, log.reportGeneratedAt || ""].join(",")
                                        ).join("\n");

                                    const encodedUri = encodeURI(csvContent);
                                    const link = document.createElement("a");
                                    link.setAttribute("href", encodedUri);
                                    link.setAttribute("download", "activity_log.csv");
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
                            >
                                <Download className="w-4 h-4" />
                                {t.dashboard.history.export}
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards (Optional overview) */}


                    {/* Main Content Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        {/* Table Toolbar */}


                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dashboard.history.table.action}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dashboard.history.table.user}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dashboard.history.table.timestamp}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dashboard.history.table.reportGenerated}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <History className="w-12 h-12 text-slate-300 mb-3" />
                                                    <p className="text-slate-600 font-medium mb-1">
                                                        {activityLogs.length === 0 ? t.dashboard.history.table.noActivity : t.dashboard.history.table.noResults}
                                                    </p>
                                                    <p className="text-sm text-slate-400">
                                                        {activityLogs.length === 0
                                                            ? "Upload a scan to see activity logs here"
                                                            : "Try adjusting your search terms"
                                                        }
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="group hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                                                            {ACTIVITY_ICONS[log.type] || <Activity className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 text-sm">{log.action}</p>
                                                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{log.details}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {log.user.charAt(0)}
                                                        </div>
                                                        <span className="text-sm text-slate-600 font-medium">{log.user}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-500 tabular-nums" suppressHydrationWarning>
                                                        {new Date(log.timestamp).toLocaleString("en-US", {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {log.reportGeneratedAt ? (
                                                        <span className="text-sm text-emerald-600 font-medium tabular-nums px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100" suppressHydrationWarning>
                                                            {new Date(log.reportGeneratedAt).toLocaleString("en-US", {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">{t.dashboard.history.table.pending}</span>
                                                    )}
                                                </td>
                                                {/* <td className="px-6 py-4 text-right">
                                                    <button className="p-2 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </td> */}
                                            </tr>
                                        )))}

                                </tbody>
                            </table>
                        </div>

                        {/* Pagination (Mock) */}
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                            <span>Showing {filteredLogs.length} of {activityLogs.length} results</span>
                            <div className="flex items-center gap-2">
                                <button disabled className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                                <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">Next</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
