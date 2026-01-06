"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DashboardSidebar } from "../../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../../components/dashboard/DashboardHeader";
import { Button } from "../../../components/ui/Button";
import {
    ArrowLeft,
    Download,
    Printer,
    Share2,
    User,
    Calendar,
    FileText,
    Activity,
    Phone,
    Mail,
    MapPin,
    Heart,
    ClipboardList,
    AlertTriangle,
    CheckCircle,
    Clock,
    Brain,
    Stethoscope,
    FileImage,
    Loader2,
} from "lucide-react";
import { getDiagnosis } from "../../../services/aiDiagnosisService";

// Mock patient data - in real app, fetch from API
const patientsData: Record<string, any> = {
    "PT-001": {
        id: "PT-001",
        name: "Rajesh Kumar",
        age: 45,
        gender: "Male",
        scanType: "CT Scan",
        scanDate: "2026-01-02",
        status: "completed",
        diagnosis: "No anomalies detected",
        email: "rajesh.kumar@email.com",
        phone: "+91 98765 43210",
        address: "42, Marine Drive, Mumbai, Maharashtra 400020",
        bloodType: "A+",
        allergies: ["Penicillin"],
        scanImage: "/shelth_dashboard_hero.png",
        aiReport: {
            summary: "Comprehensive CT scan analysis reveals no significant abnormalities. All organs appear within normal limits.",
            findings: [
                "Lungs: Clear, no infiltrates or masses detected",
                "Heart: Normal size and configuration",
                "Liver: Homogeneous texture, normal size",
                "Kidneys: Bilateral kidneys appear normal",
                "Spine: No degenerative changes noted",
            ],
            confidence: 98.5,
            recommendations: [
                "Continue regular health check-ups",
                "Maintain healthy lifestyle and diet",
                "Follow-up scan recommended in 12 months",
            ],
            riskFactors: [],
            generatedAt: "2026-01-02T10:30:00Z",
        },
    },
    "PT-002": {
        id: "PT-002",
        name: "Priya Sharma",
        age: 32,
        gender: "Female",
        scanType: "MRI",
        scanDate: "2026-01-02",
        status: "completed",
        diagnosis: "Minor inflammation observed",
        email: "priya.sharma@email.com",
        phone: "+91 87654 32109",
        address: "15, Jubilee Hills, Hyderabad, Telangana 500033",
        bloodType: "B+",
        allergies: ["Iodine Contrast", "Sulfa Drugs"],
        scanImage: "/shelth_dashboard_hero.png",
        aiReport: {
            summary: "MRI scan indicates minor inflammatory changes in the lumbar region. No critical findings requiring immediate intervention.",
            findings: [
                "Lumbar Spine: Mild disc bulge at L4-L5 level",
                "Spinal Canal: No significant stenosis",
                "Nerve Roots: No compression observed",
                "Soft Tissues: Minor inflammation noted",
                "Vertebral Bodies: Normal alignment and height",
            ],
            confidence: 94.2,
            recommendations: [
                "Physical therapy recommended for 6 weeks",
                "Anti-inflammatory medication as prescribed",
                "Avoid heavy lifting and strenuous activities",
                "Follow-up MRI in 3 months to monitor progress",
            ],
            riskFactors: ["Sedentary lifestyle", "Prolonged sitting"],
            generatedAt: "2026-01-02T11:15:00Z",
        },
    },
    "PT-003": {
        id: "PT-003",
        name: "Amit Patel",
        age: 58,
        gender: "Male",
        scanType: "X-Ray",
        scanDate: "2026-01-01",
        status: "critical",
        diagnosis: "Requires immediate attention",
        email: "amit.patel@email.com",
        phone: "+91 76543 21098",
        address: "88, Satellite Road, Ahmedabad, Gujarat 380015",
        bloodType: "O-",
        allergies: ["Aspirin", "NSAIDs"],
        scanImage: "/shelth_dashboard_hero.png",
        aiReport: {
            summary: "URGENT: X-Ray analysis reveals significant findings requiring immediate clinical correlation and specialist consultation.",
            findings: [
                "Chest: Suspicious opacity in right lower lobe",
                "Heart: Mild cardiomegaly observed",
                "Mediastinum: Widened, requires further evaluation",
                "Bones: Osteopenic changes noted",
                "Diaphragm: Normal position and contour",
            ],
            confidence: 91.8,
            recommendations: [
                "URGENT: Immediate pulmonology consultation required",
                "CT scan with contrast recommended within 48 hours",
                "Cardiac evaluation advised",
                "Complete blood work and tumor markers",
                "Patient counseling regarding findings",
            ],
            riskFactors: ["Age > 55", "Smoking history", "Family history of cardiac disease"],
            generatedAt: "2026-01-01T14:45:00Z",
        },
    },
    "PT-004": {
        id: "PT-004",
        name: "Sunita Reddy",
        age: 41,
        gender: "Female",
        scanType: "CT Scan",
        scanDate: "2026-01-01",
        status: "pending",
        diagnosis: "Awaiting analysis",
        email: "sunita.reddy@email.com",
        phone: "+91 65432 10987",
        address: "23, Koramangala, Bangalore, Karnataka 560034",
        bloodType: "AB+",
        allergies: [],
        scanImage: "/shelth_dashboard_hero.png",
        aiReport: {
            summary: "Analysis in progress. Preliminary scan review initiated.",
            findings: ["Scan processing...", "AI analysis queued"],
            confidence: 0,
            recommendations: ["Awaiting complete analysis"],
            riskFactors: [],
            generatedAt: "2026-01-01T16:00:00Z",
        },
    },
    "PT-005": {
        id: "PT-005",
        name: "Vikram Singh",
        age: 67,
        gender: "Male",
        scanType: "MRI",
        scanDate: "2025-12-31",
        status: "completed",
        diagnosis: "Age-related degeneration",
        email: "vikram.singh@email.com",
        phone: "+91 54321 09876",
        address: "56, Civil Lines, Delhi 110054",
        bloodType: "A-",
        allergies: ["Penicillin", "Iodine Contrast"],
        scanImage: "/shelth_dashboard_hero.png",
        aiReport: {
            summary: "MRI shows age-appropriate degenerative changes. No acute pathology identified. Findings consistent with normal aging process.",
            findings: [
                "Cervical Spine: Multi-level spondylotic changes",
                "Disc Spaces: Mild narrowing at C5-C6 and C6-C7",
                "Spinal Cord: No signal abnormalities",
                "Foramina: Mild bilateral foraminal narrowing",
                "Soft Tissues: No concerning masses",
            ],
            confidence: 96.7,
            recommendations: [
                "Conservative management with pain relief",
                "Neck exercises and posture correction",
                "Ergonomic workplace assessment",
                "Annual follow-up recommended",
            ],
            riskFactors: ["Age > 65", "Previous neck injury"],
            generatedAt: "2025-12-31T09:20:00Z",
        },
    },
};

const statusConfig = {
    completed: {
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        label: "Completed",
    },
    pending: {
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        label: "Pending",
    },
    critical: {
        icon: AlertTriangle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        label: "Critical",
    },
};

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [patient, setPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const patientId = params.id as string;

    // Fetch patient data
    useEffect(() => {
        const loadPatientData = async () => {
            // First check static mock data
            if (patientsData[patientId]) {
                setPatient(patientsData[patientId]);
                setIsLoading(false);
                return;
            }

            // Then check sessionStorage for dynamic diagnoses
            const dynamicDiagnosis = getDiagnosis(patientId);
            if (dynamicDiagnosis) {
                setPatient({
                    ...dynamicDiagnosis.patient,
                    aiReport: dynamicDiagnosis.aiReport,
                });

                // If no aiReport in stored data, fetch from API
                if (!dynamicDiagnosis.aiReport) {
                    setIsLoadingReport(true);
                    try {
                        const response = await fetch(`/api/diagnostic/${patientId}`);
                        if (response.ok) {
                            const result = await response.json();
                            if (result.success && result.data) {
                                setPatient((prev: any) => ({
                                    ...prev,
                                    aiReport: {
                                        summary: result.data.summary,
                                        findings: result.data.findings,
                                        confidence: result.data.confidence,
                                        recommendations: result.data.recommendations,
                                        riskFactors: result.data.riskFactors,
                                        generatedAt: result.data.generatedAt,
                                    },
                                    diagnosis: result.data.diagnosis,
                                    status: result.data.status,
                                }));
                            }
                        }
                    } catch (error) {
                        console.error("Failed to fetch AI report:", error);
                    } finally {
                        setIsLoadingReport(false);
                    }
                }
                setIsLoading(false);
                return;
            }

            // Patient not found
            setIsLoading(false);
        };

        loadPatientData();
    }, [patientId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading patient data...</p>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Patient Not Found</h1>
                    <p className="text-slate-500 mb-4">The requested patient record does not exist.</p>
                    <Link href="/dashboard">
                        <Button>Return to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const status = statusConfig[patient.status as keyof typeof statusConfig];
    const StatusIcon = status.icon;

    const handleDownloadPDF = () => {
        // Using browser print to PDF functionality
        window.print();
    };

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
                    title="Patient Report"
                    subtitle={`Detailed report for ${patient.name}`}
                />

                {/* Main Content */}
                <main className="p-6 lg:p-8" ref={reportRef}>
                    {/* Back Button & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-medium">Back to Dashboard</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => window.print()}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                            <Button variant="outline">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button onClick={handleDownloadPDF}>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>

                    {/* Patient Header Card */}
                    <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl p-6 md:p-8 text-white mb-8 relative overflow-hidden print:bg-slate-800">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <User className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold">{patient.name}</h1>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm`}>
                                        <StatusIcon className="w-4 h-4" />
                                        {status.label}
                                    </span>
                                </div>
                                <p className="text-white/80">Patient ID: {patient.id} • {patient.age} years • {patient.gender}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-sm">Scan Date</p>
                                <p className="text-xl font-semibold">
                                    {new Date(patient.scanDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Patient Info & Image */}
                        <div className="space-y-6">
                            {/* Patient Information */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-[var(--color-primary)]" />
                                        Patient Information
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={patient.email} />
                                    <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={patient.phone} />
                                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={patient.address} />
                                    <InfoRow icon={<Heart className="w-4 h-4" />} label="Blood Type" value={patient.bloodType} />
                                    <InfoRow icon={<FileText className="w-4 h-4" />} label="Scan Type" value={patient.scanType} />
                                </div>
                            </div>

                            {/* Allergies */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        Known Allergies
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {patient.allergies.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {patient.allergies.map((allergy: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100"
                                                >
                                                    {allergy}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-sm">No known allergies</p>
                                    )}
                                </div>
                            </div>

                            {/* Scanned Image */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                        <FileImage className="w-5 h-5 text-[var(--color-primary)]" />
                                        Scanned Image
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
                                        {/* Check if scanImage is a base64 data URL or a static path */}
                                        {patient.scanImage?.startsWith('data:') ? (
                                            /* Use regular img for base64 data URLs (uploaded DICOM/images) */
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={patient.scanImage}
                                                alt="Medical Scan"
                                                className="absolute inset-0 w-full h-full object-cover print:block"
                                            />
                                        ) : (
                                            /* Use Next.js Image for static file paths */
                                            <>
                                                <Image
                                                    src={patient.scanImage}
                                                    alt="Medical Scan"
                                                    fill
                                                    className="object-cover print:hidden"
                                                />
                                                {/* Regular img for print */}
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={patient.scanImage}
                                                    alt="Medical Scan"
                                                    className="hidden print:block w-full h-full object-cover"
                                                />
                                            </>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent print:hidden" />
                                        <div className="absolute bottom-4 left-4 text-white print:hidden">
                                            <p className="text-sm font-medium">{patient.scanType}</p>
                                            <p className="text-xs text-white/70">{patient.scanDate}</p>
                                        </div>
                                    </div>
                                    <p className="hidden print:block text-center text-sm text-slate-600 mt-2">
                                        {patient.scanType} - {patient.scanDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - AI Report */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* AI Analysis Summary */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-[var(--color-primary)]" />
                                        AI Analysis Report
                                    </h2>
                                    {patient.aiReport && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">Confidence:</span>
                                            <span className={`text-sm font-bold ${patient.aiReport.confidence >= 95 ? "text-emerald-600" :
                                                patient.aiReport.confidence >= 80 ? "text-amber-600" : "text-red-600"
                                                }`}>
                                                {patient.aiReport.confidence}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    {isLoadingReport ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-4" />
                                            <p className="text-slate-600 font-medium">Fetching AI Analysis...</p>
                                            <p className="text-sm text-slate-500">Processing your scan with our AI model</p>
                                        </div>
                                    ) : patient.aiReport ? (
                                        <>
                                            {/* Summary */}
                                            <div className={`p-4 rounded-xl mb-6 ${status.bg} ${status.border} border`}>
                                                <p className={`font-medium ${status.color}`}>{patient.aiReport.summary}</p>
                                            </div>

                                            {/* Findings */}
                                            <div className="mb-6">
                                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Stethoscope className="w-4 h-4" />
                                                    Key Findings
                                                </h3>
                                                <ul className="space-y-2">
                                                    {patient.aiReport.findings.map((finding: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-3 text-slate-700">
                                                            <CheckCircle className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                                                            <span>{finding}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Recommendations */}
                                            <div className="mb-6">
                                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <ClipboardList className="w-4 h-4" />
                                                    Recommendations
                                                </h3>
                                                <ul className="space-y-2">
                                                    {patient.aiReport.recommendations.map((rec: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-3 text-slate-700">
                                                            <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                {index + 1}
                                                            </span>
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Risk Factors */}
                                            {patient.aiReport.riskFactors && patient.aiReport.riskFactors.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        Risk Factors
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {patient.aiReport.riskFactors.map((risk: string, index: number) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100"
                                                            >
                                                                {risk}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className={`p-4 rounded-xl ${status.bg} ${status.border} border`}>
                                            <p className={`font-medium ${status.color}`}>
                                                AI analysis is pending. The report will be available once processing is complete.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Report Footer */}
                                {patient.aiReport && (
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                                        <span>Report generated by Shealth AI</span>
                                        <span>
                                            {new Date(patient.aiReport.generatedAt).toLocaleString("en-IN", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Diagnosis Summary Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-[var(--color-primary)]" />
                                        Diagnosis Summary
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className={`p-4 rounded-xl ${status.bg} ${status.border} border`}>
                                        <div className="flex items-start gap-3">
                                            <StatusIcon className={`w-6 h-6 ${status.color} mt-0.5`} />
                                            <div>
                                                <p className={`font-semibold text-lg ${status.color}`}>
                                                    {patient.diagnosis || status.label}
                                                </p>
                                                <p className="text-slate-600 mt-1">
                                                    {patient.aiReport
                                                        ? `Based on AI analysis with ${patient.aiReport.confidence}% confidence level.`
                                                        : "AI analysis pending. Results will be available soon."
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Print Styles */}
                    <style jsx global>{`
                        @media print {
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            body {
                                background: white !important;
                            }
                            body > div > aside,
                            body > div > div > header,
                            .no-print {
                                display: none !important;
                            }
                            body > div > div {
                                margin-left: 0 !important;
                            }
                            main {
                                padding: 20px !important;
                            }
                            img {
                                max-width: 100% !important;
                                height: auto !important;
                                display: block !important;
                            }
                            .print\:hidden {
                                display: none !important;
                            }
                            .print\:block {
                                display: block !important;
                            }
                            .rounded-2xl {
                                border-radius: 8px !important;
                            }
                            @page {
                                margin: 0.5in;
                                size: A4;
                            }
                        }
                    `}</style>
                </main>
            </div >
        </div >
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-slate-900 font-medium">{value}</p>
            </div>
        </div>
    );
}
