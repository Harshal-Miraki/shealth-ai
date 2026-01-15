import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Download, MoreHorizontal, CheckCircle, Clock, AlertCircle, Trash2 } from "lucide-react";
import { getAllDiagnoses, deleteDiagnosis, getDiagnosis } from "../../services/aiDiagnosisService";
import { generateDiagnosisReport } from "../../services/pdfService";
import { useLanguage } from "../../context/LanguageContext";

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

function PatientsTableContent() {
    const { translations: t } = useLanguage();
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch patients from localStorage and filter
    useEffect(() => {
        const storedDiagnoses = getAllDiagnoses();
        if (storedDiagnoses.length > 0) {
            let storedPatients: Patient[] = storedDiagnoses.map(d => ({
                id: d.id,
                name: d.patient.name,
                age: d.patient.age,
                gender: d.patient.gender,
                scanType: d.patient.scanType,
                scanDate: d.patient.scanDate,
                status: d.patient.status,
                diagnosis: d.aiReport?.summary || d.patient.diagnosis || "Analysis Complete"
            }));

            if (searchQuery) {
                storedPatients = storedPatients.filter(p =>
                    p.name.toLowerCase().includes(searchQuery) ||
                    p.id.toLowerCase().includes(searchQuery)
                );
            }

            setPatients(storedPatients);
            setCurrentPage(1); // Reset to first page on search
        }
    }, [searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(patients.length / itemsPerPage);
    const displayedPatients = patients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRowClick = (patientId: string) => {
        router.push(`/dashboard/patient/${patientId}`);
    };

    const handleDelete = (e: React.MouseEvent, patientId: string) => {
        e.stopPropagation();
        if (window.confirm(t.dashboard.patientsTable.confirmDelete)) {
            deleteDiagnosis(patientId);
            setPatients(prev => prev.filter(p => p.id !== patientId));
            setActiveMenuId(null);
        }
    };

    const toggleMenu = (e: React.MouseEvent, patientId: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === patientId ? null : patientId);
    };

    const handleDownload = (e: React.MouseEvent, patientId: string) => {
        e.stopPropagation();

        // Get full diagnosis data from localStorage
        const diagnosis = getDiagnosis(patientId);

        if (diagnosis && diagnosis.aiReport) {
            generateDiagnosisReport({
                patient: {
                    id: diagnosis.patient.id,
                    name: diagnosis.patient.name,
                    age: diagnosis.patient.age,
                    gender: diagnosis.patient.gender,
                    scanType: diagnosis.patient.scanType,
                    scanDate: diagnosis.patient.scanDate,
                    email: diagnosis.patient.email,
                    phone: diagnosis.patient.phone,
                    bloodType: diagnosis.patient.bloodType,
                },
                diagnosis: diagnosis.patient.diagnosis,
                aiReport: {
                    summary: diagnosis.aiReport.summary,
                    findings: diagnosis.aiReport.findings,
                    recommendations: diagnosis.aiReport.recommendations,
                    generatedAt: diagnosis.aiReport.generatedAt,
                    confidence: diagnosis.aiReport.confidence,
                },
            });
        } else {
            alert('AI report is not available for this patient.');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">{t.dashboard.patientsTable.title}</h2>
                    <p className="text-sm text-slate-500">{t.dashboard.patientsTable.subtitle}</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-slate-50 rounded-lg transition-colors">
                    {t.dashboard.patientsTable.viewAll}
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t.dashboard.patientsTable.headers.patientId}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t.dashboard.patientsTable.headers.name}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t.dashboard.patientsTable.headers.ageGender}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t.dashboard.patientsTable.headers.scanType}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t.dashboard.patientsTable.headers.date}
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t.dashboard.patientsTable.headers.diagnosis}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t.dashboard.patientsTable.headers.actions}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                    {t.dashboard.patientsTable.empty}
                                </td>
                            </tr>
                        ) : (
                            displayedPatients.length > 0 ? displayedPatients.map((patient) => {
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
                                            <span className="text-sm text-slate-600 max-w-[200px] truncate block">
                                                {patient.diagnosis}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleDownload(e, patient.id)}
                                                    className="p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-slate-100 rounded-lg transition-colors"
                                                    title={t.dashboard.patientsTable.download}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => toggleMenu(e, patient.id)}
                                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title={t.dashboard.patientsTable.moreOptions}
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {activeMenuId === patient.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 z-50 overflow-hidden">
                                                            <button
                                                                onClick={(e) => handleDelete(e, patient.id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                {t.dashboard.patientsTable.delete}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        {t.dashboard.patientsTable.noMatch}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {patients.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                        {t.dashboard.patientsTable.showing}{" "}
                        <span className="font-medium text-slate-700">
                            {Math.min((currentPage - 1) * itemsPerPage + 1, patients.length)}
                        </span>{" "}
                        {t.dashboard.patientsTable.of}{" "}
                        <span className="font-medium text-slate-700">
                            {Math.min(currentPage * itemsPerPage, patients.length)}
                        </span>{" "}
                        {t.dashboard.patientsTable.of} <span className="font-medium text-slate-700">{patients.length}</span> {t.dashboard.patientsTable.patients}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t.dashboard.patientsTable.previous}
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t.dashboard.patientsTable.next}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function PatientsTable() {
    return (
        <Suspense fallback={
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-96 flex items-center justify-center">
                <div className="text-slate-400">Loading patients...</div>
            </div>
        }>
            <PatientsTableContent />
        </Suspense>
    );
}