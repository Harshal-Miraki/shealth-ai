"use client";

import React, { useState } from "react";
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

// Mock Data
const MOCK_LOGS = [
    {
        id: "1",
        action: "DICOM Upload",
        details: "Chest_XRay_001.dcm uploaded successfully",
        type: "upload",
        status: "success",
        timestamp: "2024-03-10T14:30:00",
        user: "Dr. Harshal"
    },
    {
        id: "2",
        action: "AI Analysis",
        details: "Pneumonia detection initiated for Patient #4492",
        type: "analysis",
        status: "processing",
        timestamp: "2024-03-10T14:31:00",
        user: "System"
    },
    {
        id: "3",
        action: "Report Generated",
        details: "Analysis report #9921 created",
        type: "report",
        status: "success",
        timestamp: "2024-03-10T14:32:15",
        user: "Dr. Harshal"
    },
    {
        id: "4",
        action: "Login",
        details: "Successful login via secure auth",
        type: "security",
        status: "success",
        timestamp: "2024-03-10T09:00:00",
        user: "Dr. Harshal"
    },
    {
        id: "5",
        action: "Export Failed",
        details: "Network interruption during bulk export",
        type: "export",
        status: "failed",
        timestamp: "2024-03-09T18:45:00",
        user: "Dr. Harshal"
    },
    {
        id: "6",
        action: "View Patient",
        details: "Viewed patient records for ID #8821",
        type: "view",
        status: "success",
        timestamp: "2024-03-09T16:20:00",
        user: "Dr. Harshal"
    },
    {
        id: "7",
        action: "System Update",
        details: "Core models updated to v2.1.0",
        type: "system",
        status: "success",
        timestamp: "2024-03-09T03:00:00",
        user: "Admin"
    },
];

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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter logs based on search
    const filteredLogs = MOCK_LOGS.filter(log =>
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
                    title="Activity History"
                    subtitle="Monitor and track all system activities and user actions"
                />

                <main className="p-6 lg:p-8 space-y-8">
                    {/* Header Section Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium shadow-sm">
                                <Download className="w-4 h-4" />
                                Export Log
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-lg shadow-blue-500/20">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards (Optional overview) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Total Actions</p>
                                    <h3 className="text-2xl font-bold text-slate-900">1,284</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Success Rate</p>
                                    <h3 className="text-2xl font-bold text-slate-900">98.5%</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Last Activity</p>
                                    <h3 className="text-2xl font-bold text-slate-900">2 min ago</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        {/* Table Toolbar */}
                        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search activity logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLogs.map((log) => (
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
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[log.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                    {log.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                                                    {log.status === 'failed' && <XCircle className="w-3 h-3" />}
                                                    {log.status === 'processing' && <Clock className="w-3 h-3 animate-pulse" />}
                                                    <span className="capitalize">{log.status}</span>
                                                </span>
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
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination (Mock) */}
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                            <span>Showing {filteredLogs.length} of {MOCK_LOGS.length} results</span>
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
