"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { Button } from "../../components/ui/Button";
import {
    Loader2,
    Shield,
    FileCheck,
    Brain,
    UploadCloud,
    X,
    User,
    Calendar,
    Stethoscope,
    ArrowRight,
    Sparkles,
    FileText,
    Activity,
    Hash,
    Building2,
    ClipboardList,
    AlertCircle
} from "lucide-react";
import { runAIDiagnosis, storeDiagnosis, PatientInfo } from "../../services/aiDiagnosisService";
import { dicomService, DicomMetadata } from "../../services/dicomService";
import { DicomViewer } from "../../components/dashboard/DicomViewer";

export default function UploadPage() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isRunningDiagnosis, setIsRunningDiagnosis] = useState(false);
    const [isParsingDicom, setIsParsingDicom] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // DICOM metadata
    const [dicomMetadata, setDicomMetadata] = useState<DicomMetadata | null>(null);
    const [dicomError, setDicomError] = useState<string | null>(null);
    const [isDicomFile, setIsDicomFile] = useState(false);
    const [renderedDicomImage, setRenderedDicomImage] = useState<string | null>(null);

    // Patient info form state - auto-filled from DICOM when available
    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    const [patientGender, setPatientGender] = useState("Male");
    const [scanType, setScanType] = useState("CT Scan");

    // Auto-fill form when DICOM metadata is parsed
    useEffect(() => {
        if (dicomMetadata) {
            if (dicomMetadata.patientName && dicomMetadata.patientName !== "Anonymized") {
                setPatientName(dicomMetadata.patientName);
            }
            // Map modality to scan type
            const modalityMap: Record<string, string> = {
                "CT": "CT Scan",
                "MR": "MRI",
                "MRI": "MRI",
                "XR": "X-Ray",
                "CR": "X-Ray",
                "DX": "X-Ray",
                "US": "Ultrasound",
            };
            if (dicomMetadata.modality && modalityMap[dicomMetadata.modality]) {
                setScanType(modalityMap[dicomMetadata.modality]);
            }
        }
    }, [dicomMetadata]);

    const handleFileSelect = async (file: File) => {
        setUploadedFile(file);
        setDicomError(null);
        setDicomMetadata(null);
        setImagePreview(null);

        // Check if it's a DICOM file
        const isDicom = file.name.toLowerCase().endsWith('.dcm') ||
            file.name.toLowerCase().endsWith('.dicom') ||
            file.type === 'application/dicom';

        setIsDicomFile(isDicom);

        if (isDicom) {
            // Parse DICOM file for metadata
            setIsParsingDicom(true);
            try {
                const { metadata } = await dicomService.parseDicom(file);
                setDicomMetadata(metadata);
                // DicomViewer component will handle rendering the actual image
            } catch (error) {
                console.error("DICOM parsing error:", error);
                setDicomError("Could not parse DICOM metadata. File may be corrupted.");
            } finally {
                setIsParsingDicom(false);
            }
        } else {
            // Regular image file - create preview
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setImagePreview("/shelth_dashboard_hero.png");
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleReset = () => {
        setUploadedFile(null);
        setImagePreview(null);
        setDicomMetadata(null);
        setDicomError(null);
        setIsDicomFile(false);
        setRenderedDicomImage(null);
        setPatientName("");
        setPatientAge("");
        setPatientGender("Male");
        setScanType("CT Scan");
    };

    const handleRunDiagnosis = async () => {
        if (!uploadedFile || !patientName || !patientAge) {
            alert("Please fill in all patient details before running diagnosis.");
            return;
        }

        // For DICOM files, ensure we have the rendered image
        if (isDicomFile && !renderedDicomImage) {
            alert("Please wait for the DICOM image to finish rendering.");
            return;
        }

        setIsRunningDiagnosis(true);

        try {
            const patientInfo: PatientInfo = {
                name: patientName,
                age: parseInt(patientAge),
                gender: patientGender,
                scanType: scanType,
            };

            // Run AI diagnosis - pass rendered DICOM image if available
            const result = await runAIDiagnosis(
                uploadedFile,
                patientInfo,
                isDicomFile ? renderedDicomImage || undefined : undefined
            );

            // Store the result
            storeDiagnosis(result);

            // Navigate to patient detail page
            router.push(`/dashboard/patient/${result.id}`);
        } catch (error) {
            console.error("Diagnosis failed:", error);
            alert("Failed to run diagnosis. Please try again.");
            setIsRunningDiagnosis(false);
        }
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
                    title="Upload Scan"
                    subtitle="Upload and analyze medical imaging data"
                />

                {/* Main Content */}
                <main className="p-6 lg:p-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            {uploadedFile ? "Review & Analyze Scan" : "Upload Medical Scan"}
                        </h1>
                        <p className="text-slate-500">
                            {uploadedFile
                                ? "Review extracted information and run AI-powered diagnosis"
                                : "Upload XRAY, MRI, or CT scans for AI-powered analysis and insights."
                            }
                        </p>
                    </div>

                    {/* Running Diagnosis State */}
                    {isRunningDiagnosis ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                                        <Brain className="w-12 h-12 text-white animate-pulse" />
                                    </div>
                                    <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-[var(--color-accent)]/30 animate-ping" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Running AI Diagnosis...</h3>
                                <p className="text-slate-500 mb-6 text-center max-w-md">
                                    Our AI is analyzing the scan and generating a comprehensive medical report. This may take a few moments.
                                </p>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Analyzing image patterns and generating findings...</span>
                                </div>
                            </div>
                        </div>
                    ) : uploadedFile ? (
                        /* File Uploaded - Show DICOM Info, Image, and Form */
                        <div className="space-y-6">
                            {/* DICOM Metadata Section */}
                            {dicomMetadata && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5">
                                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                                            DICOM Metadata Extracted
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">Information extracted from the uploaded DICOM file</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <MetadataCard
                                                icon={<User className="w-4 h-4" />}
                                                label="Patient Name"
                                                value={dicomMetadata.patientName}
                                            />
                                            <MetadataCard
                                                icon={<Hash className="w-4 h-4" />}
                                                label="Patient ID"
                                                value={dicomMetadata.patientId}
                                            />
                                            <MetadataCard
                                                icon={<Calendar className="w-4 h-4" />}
                                                label="Study Date"
                                                value={dicomMetadata.studyDate}
                                            />
                                            <MetadataCard
                                                icon={<Activity className="w-4 h-4" />}
                                                label="Modality"
                                                value={dicomMetadata.modality}
                                            />
                                            <MetadataCard
                                                icon={<Building2 className="w-4 h-4" />}
                                                label="Manufacturer"
                                                value={dicomMetadata.manufacturer}
                                            />
                                            <MetadataCard
                                                icon={<ClipboardList className="w-4 h-4" />}
                                                label="Study Description"
                                                value={dicomMetadata.studyDescription}
                                            />
                                            <MetadataCard
                                                icon={<FileText className="w-4 h-4" />}
                                                label="Series Description"
                                                value={dicomMetadata.seriesDescription || "N/A"}
                                            />
                                            <MetadataCard
                                                icon={<Hash className="w-4 h-4" />}
                                                label="Instance #"
                                                value={dicomMetadata.instanceNumber}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DICOM Error */}
                            {dicomError && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800">DICOM Parsing Warning</p>
                                        <p className="text-sm text-amber-700">{dicomError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left - Image Preview */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-slate-900">Uploaded Scan</h2>
                                        <button
                                            onClick={handleReset}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {isParsingDicom ? (
                                            <div className="aspect-square rounded-xl bg-slate-100 flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
                                                <p className="text-slate-600 font-medium">Parsing DICOM file...</p>
                                                <p className="text-sm text-slate-500">Extracting metadata and image</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-4">
                                                    {isDicomFile && uploadedFile ? (
                                                        // Render actual DICOM image and capture as PNG
                                                        <DicomViewer
                                                            file={uploadedFile}
                                                            className="absolute inset-0 w-full h-full"
                                                            onImageRendered={(imageDataUrl) => setRenderedDicomImage(imageDataUrl)}
                                                        />
                                                    ) : imagePreview ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={imagePreview}
                                                            alt="Uploaded scan"
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                                            No preview available
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
                                                    <div className="absolute bottom-4 left-4 text-white z-10">
                                                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                                                        <p className="text-xs text-white/70">
                                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <FileCheck className="w-4 h-4 text-emerald-500" />
                                                    <span>File uploaded successfully</span>
                                                    {dicomMetadata && (
                                                        <span className="ml-auto text-[var(--color-primary)] font-medium">
                                                            DICOM Parsed ✓
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right - Patient Information Form */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="text-lg font-semibold text-slate-900">Patient Information</h2>
                                        <p className="text-sm text-slate-500">
                                            {dicomMetadata ? "Auto-filled from DICOM. Review and complete details." : "Enter patient details for the diagnosis report"}
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        {/* Patient Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <User className="w-4 h-4 inline mr-2" />
                                                Patient Name
                                                {dicomMetadata?.patientName && dicomMetadata.patientName !== "Anonymized" && (
                                                    <span className="ml-2 text-xs text-emerald-600">(from DICOM)</span>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={patientName}
                                                onChange={(e) => setPatientName(e.target.value)}
                                                placeholder="Enter patient's full name"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                                            />
                                        </div>

                                        {/* Age and Gender */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    <Calendar className="w-4 h-4 inline mr-2" />
                                                    Age
                                                </label>
                                                <input
                                                    type="number"
                                                    value={patientAge}
                                                    onChange={(e) => setPatientAge(e.target.value)}
                                                    placeholder="Years"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Gender
                                                </label>
                                                <select
                                                    value={patientGender}
                                                    onChange={(e) => setPatientGender(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Scan Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <Stethoscope className="w-4 h-4 inline mr-2" />
                                                Scan Type
                                                {dicomMetadata?.modality && (
                                                    <span className="ml-2 text-xs text-emerald-600">(from DICOM: {dicomMetadata.modality})</span>
                                                )}
                                            </label>
                                            <select
                                                value={scanType}
                                                onChange={(e) => setScanType(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                                            >
                                                <option value="CT Scan">CT Scan</option>
                                                <option value="MRI">MRI</option>
                                                <option value="X-Ray">X-Ray</option>
                                                <option value="Ultrasound">Ultrasound</option>
                                            </select>
                                        </div>

                                        {/* Run Diagnosis Button */}
                                        <div className="pt-4">
                                            <Button
                                                onClick={handleRunDiagnosis}
                                                className="w-full h-14 text-lg shadow-lg"
                                                disabled={!patientName || !patientAge || isParsingDicom}
                                            >
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Run AI Diagnosis
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>
                                            <p className="text-xs text-center text-slate-400 mt-3">
                                                AI will analyze the scan and generate a detailed report
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* No File - Show Upload Zone */
                        <>
                            {/* Features Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <FeatureCard
                                    icon={<FileCheck className="w-5 h-5" />}
                                    title="DICOM Support"
                                    description="Auto-extracts patient info from DICOM metadata"
                                />
                                <FeatureCard
                                    icon={<Brain className="w-5 h-5" />}
                                    title="AI Analysis"
                                    description="Advanced neural network diagnostics"
                                />
                                <FeatureCard
                                    icon={<Shield className="w-5 h-5" />}
                                    title="Secure Upload"
                                    description="End-to-end encryption & HIPAA compliant"
                                />
                            </div>

                            {/* Upload Zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                onDrop={handleDrop}
                                className={`
                                    relative w-full rounded-2xl border-[3px] border-dashed transition-all duration-300 cursor-pointer bg-white
                                    ${isDragging
                                        ? "border-[var(--color-primary)] bg-teal-50/50 scale-[1.01] shadow-xl"
                                        : "border-slate-200 hover:border-[var(--color-primary)]/50 hover:shadow-lg"
                                    }
                                `}
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileInputChange}
                                    accept=".dcm,.jpg,.jpeg,.png,.dicom,application/dicom"
                                />
                                <div className="p-12 md:p-16 text-center flex flex-col items-center justify-center">
                                    <div className={`
                                        w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-all duration-300
                                        ${isDragging
                                            ? "bg-[var(--color-primary)] text-white scale-110"
                                            : "bg-slate-100 text-slate-400 group-hover:text-[var(--color-primary)]"
                                        }
                                    `}>
                                        <UploadCloud className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                        Upload Medical Scans
                                    </h3>
                                    <p className="text-lg text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                                        Drag and drop your XRAY, MRI, or CT scans here.
                                        <span className="block text-sm mt-2 text-[var(--color-primary)]">
                                            DICOM files will auto-extract patient metadata!
                                        </span>
                                    </p>
                                    <Button className="pointer-events-none">
                                        Browse Files
                                    </Button>
                                    <p className="text-sm text-slate-400 mt-4">
                                        Supported formats: .dcm, .dicom, .jpg, .png
                                    </p>
                                </div>
                            </div>

                            {/* Info Footer */}
                            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span>HIPAA Compliant</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>DICOM Standard</span>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>End-to-End Encrypted</span>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-primary)] mb-3">
                {icon}
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
    );
}

function MetadataCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                {icon}
                <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className="text-slate-900 font-semibold truncate" title={value}>
                {value || "N/A"}
            </p>
        </div>
    );
}
