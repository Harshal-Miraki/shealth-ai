"use client";

import React, { useState } from "react";
import {
    BarChart3,
    PieChart,
    Activity,
    TrendingUp,
    Users,
    FileText,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter
} from "lucide-react";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

// Mock Data for Charts
const WEEKLY_DATA = [
    { name: 'Mon', total: 12, xray: 5, ct: 4, mri: 3 },
    { name: 'Tue', total: 19, xray: 8, ct: 6, mri: 5 },
    { name: 'Wed', total: 15, xray: 6, ct: 5, mri: 4 },
    { name: 'Thu', total: 22, xray: 10, ct: 7, mri: 5 },
    { name: 'Fri', total: 28, xray: 12, ct: 10, mri: 6 },
    { name: 'Sat', total: 14, xray: 5, ct: 5, mri: 4 },
    { name: 'Sun', total: 8, xray: 3, ct: 3, mri: 2 },
];

const SCAN_DISTRIBUTION = [
    { name: 'X-Ray', value: 450, color: '#3b82f6' }, // blue-500
    { name: 'CT Scan', value: 320, color: '#10b981' }, // emerald-500
    { name: 'MRI', value: 210, color: '#8b5cf6' }, // violet-500
];

// ... (ACCURACY_TREND remains same)

// ... (in AnalyticsPage component)

{/* Distribution Chart */ }
<div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6">
    <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Modality Split</h3>
        <p className="text-sm text-slate-500">By scan type</p>
    </div>
    <div className="h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
                <Pie
                    data={SCAN_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {SCAN_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
            </RechartsPieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-slate-900">980</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
        </div>
    </div>
    <div className="mt-6 flex flex-col gap-3">
        {SCAN_DISTRIBUTION.map((item) => (
            <div key={item.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${(item.value / 9.8)}%`,
                                backgroundColor: item.color
                            }}
                        />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-8 text-right">{Math.round(item.value / 9.8)}%</span>
                </div>
            </div>
        ))}
    </div>
</div>

const ACCURACY_TREND = [
    { name: 'Week 1', accuracy: 94 },
    { name: 'Week 2', accuracy: 95.5 },
    { name: 'Week 3', accuracy: 96.2 },
    { name: 'Week 4', accuracy: 97.8 }, // Current
];

// Recharts Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                <p className="font-semibold text-slate-900 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="capitalize">{entry.name}:</span>
                        <span className="font-bold">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [timeRange, setTimeRange] = useState("This Week");

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
                    title="Analytics & Statistics"
                    subtitle="Visual insights into your medical imaging data"
                />

                <main className="p-6 lg:p-8 space-y-8">
                    {/* Top Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Performance Overview</h2>
                            <p className="text-slate-500 text-sm">Key metrics for the selected period</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                            {["Today", "This Week", "This Month"].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${timeRange === range
                                            ? "bg-slate-900 text-white shadow-md"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Scans"
                            value="1,284"
                            trend="+12.5%"
                            trendUp={true}
                            icon={<FileText className="w-6 h-6 text-blue-600" />}
                            bg="bg-blue-50"
                        />
                        <StatCard
                            title="AI Accuracy"
                            value="97.8%"
                            trend="+2.1%"
                            trendUp={true}
                            icon={<Target className="w-6 h-6 text-emerald-600" />} // Imported below
                            bg="bg-emerald-50"
                        />
                        <StatCard
                            title="Avg. Analysis Time"
                            value="1.2s"
                            trend="-0.3s"
                            trendUp={true} // Lower time is good
                            icon={<Activity className="w-6 h-6 text-violet-600" />}
                            bg="bg-violet-50"
                        />
                        <StatCard
                            title="Active Patients"
                            value="53"
                            trend="+5.4%"
                            trendUp={true}
                            icon={<Users className="w-6 h-6 text-amber-600" />}
                            bg="bg-amber-50"
                        />
                    </div>

                    {/* Charts Section 1: Main Trend & Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Scan Volume Trends</h3>
                                    <p className="text-sm text-slate-500">Daily scan processing numbers</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" /> X-Ray
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> CT Scan
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <div className="w-2 h-2 rounded-full bg-violet-500" /> MRI
                                    </div>
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Distribution Chart */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Modality Split</h3>
                                <p className="text-sm text-slate-500">By scan type</p>
                            </div>
                            <div className="h-[250px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={SCAN_DISTRIBUTION}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {SCAN_DISTRIBUTION.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold text-slate-900">1,130</span>
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col gap-3">
                                {SCAN_DISTRIBUTION.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(item.value / 11.3)}%`,
                                                        backgroundColor: item.color
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 w-8 text-right">{Math.round(item.value / 11.3)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Accuracy & Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bar Chart - Accuracy per modailty */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">AI Confidence Levels</h3>
                                    <p className="text-sm text-slate-500">Average confidence score by modality</p>
                                </div>
                                <BarChart3 className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={SCAN_DISTRIBUTION} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} width={80} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                                                            Avg Confidence: <span className="font-bold">{(90 + Math.random() * 8).toFixed(1)}%</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                            {SCAN_DISTRIBUTION.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Alerts / Insights */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                        <Activity className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">System Insights</h3>
                                        <p className="text-white/60 text-sm">Automated analysis summary</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                            <div>
                                                <p className="font-medium text-sm">High Accuracy Detected</p>
                                                <p className="text-xs text-white/50 mt-1">X-Ray analysis accuracy trending up by 2.4% this week.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                            <div>
                                                <p className="font-medium text-sm">Unusual MRI Volume</p>
                                                <p className="text-xs text-white/50 mt-1">MRI uploads are 15% higher than typical daily average.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                            <div>
                                                <p className="font-medium text-sm">Processing Optimal</p>
                                                <p className="text-xs text-white/50 mt-1">Average inference time is holding steady at 1.2s.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="mt-6 w-full py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg">
                                    Generate Detailed Report
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, trendUp, icon, bg }: any) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{value}</p>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
            </div>
        </div>
    );
}

// Icon component since Target isn't in top import yet
import { Target } from "lucide-react";
