"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Eye, Download, MoreHorizontal, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    scanType: string;
    scanDate: string;
    status: "completed" | "pending" | "critical";
    diagnosis: string;
}

const mockPatients: Patient[] = [
    {
        id: "PT-001",
        name: "Rajesh Kumar",
        age: 45,
        gender: "Male",
        scanType: "CT Scan",
        scanDate: "2026-01-02",
        status: "completed",
        diagnosis: "No anomalies detected",
    },
    {
        id: "PT-002",
        name: "Priya Sharma",
        age: 32,
        gender: "Female",
        scanType: "MRI",
        scanDate: "2026-01-02",
        status: "completed",
        diagnosis: "Minor inflammation observed",
    },
    {
        id: "PT-003",
        name: "Amit Patel",
        age: 58,
        gender: "Male",
        scanType: "X-Ray",
        scanDate: "2026-01-01",
        status: "critical",
        diagnosis: "Requires immediate attention",
    },
    {
        id: "PT-004",
        name: "Sunita Reddy",
        age: 41,
        gender: "Female",
        scanType: "CT Scan",
        scanDate: "2026-01-01",
        status: "pending",
        diagnosis: "Awaiting analysis",
    },
    {
        id: "PT-005",
        name: "Vikram Singh",
        age: 67,
        gender: "Male",
        scanType: "MRI",
        scanDate: "2025-12-31",
        status: "completed",
        diagnosis: "Age-related degeneration",
    },
];

const statusConfig = {
    completed: {
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        label: "Completed",
    },
    pending: {
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
        label: "Pending",
    },
    critical: {
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        label: "Critical",
    },
};

export function PatientsTable() {
    const router = useRouter();

    const handleRowClick = (patientId: string) => {
        router.push(`/dashboard/patient/${patientId}`);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Recent Scanned Reports</h2>
                    <p className="text-sm text-slate-500">Click on a patient to view detailed report</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-slate-50 rounded-lg transition-colors">
                    View All
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Patient ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Age / Gender
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Scan Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Diagnosis
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {mockPatients.map((patient) => {
                            const status = statusConfig[patient.status];
                            const StatusIcon = status.icon;

                            return (
                                <tr
                                    key={patient.id}
                                    onClick={() => handleRowClick(patient.id)}
                                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono text-slate-600">
                                            {patient.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-900">
                                            {patient.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">
                                            {patient.age} / {patient.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                                            {patient.scanType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">
                                            {new Date(patient.scanDate).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}
                                        >
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600 max-w-[200px] truncate block">
                                            {patient.diagnosis}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(patient.id);
                                                }}
                                                className="p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-slate-100 rounded-lg transition-colors"
                                                title="View Report"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-slate-100 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="More Options"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                    Showing <span className="font-medium text-slate-700">5</span> of{" "}
                    <span className="font-medium text-slate-700">24</span> patients
                </span>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled>
                        Previous
                    </button>
                    <button className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
