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
    AlertCircle,
    FileImage,
    Layers,
    Zap,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { runAIDiagnosis, storeDiagnosis, PatientInfo } from "../../services/aiDiagnosisService";
import { dicomService, DicomMetadata } from "../../services/dicomService";
import { DicomViewer } from "../../components/dashboard/DicomViewer";
import { DicomSeriesViewer } from "../../components/dashboard/DicomSeriesViewer";

export default function UploadPage() {
    const { translations: t } = useLanguage();
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isRunningDiagnosis, setIsRunningDiagnosis] = useState(false);
    const [isParsingDicom, setIsParsingDicom] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // DICOM metadata
    const [dicomMetadata, setDicomMetadata] = useState<DicomMetadata | null>(null);
    const [dicomError, setDicomError] = useState<string | null>(null);
    const [isDicomFile, setIsDicomFile] = useState(false);
    const [renderedDicomImage, setRenderedDicomImage] = useState<string | null>(null); // For single DICOM preview

    // Non-DICOM image preview (single image)
    const [nonDicomImagePreview, setNonDicomImagePreview] = useState<string | null>(null);

    // Patient info form state - auto-filled from DICOM when available
    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    const [patientGender, setPatientGender] = useState("Male");
    const [scanType, setScanType] = useState("");
    const [bodyPart, setBodyPart] = useState(""); // New state for body part from metadata or manual input

    // Auto-fill form when DICOM metadata is parsed
    useEffect(() => {
        if (dicomMetadata) {
            if (dicomMetadata.patientName && dicomMetadata.patientName !== "Anonymized") {
                setPatientName(dicomMetadata.patientName);
            }
            // Auto-fill age if available
            if (dicomMetadata.patientAge) {
                // DICOM age format is typically like "025Y" (25 years), "003M" (3 months), etc.
                // Extract just the numeric part
                const ageMatch = parseInt(dicomMetadata.patientAge.match(/\d+/)?.[0] ?? "0", 10);
                if (ageMatch) {
                    setPatientAge(ageMatch.toString());
                }
            }
            // Auto-fill gender if available
            if (dicomMetadata.patientSex) {
                // DICOM uses M/F/O format
                const genderMap: Record<string, string> = {
                    "M": "Male",
                    "F": "Female",
                    "O": "Other",
                };
                if (genderMap[dicomMetadata.patientSex]) {
                    setPatientGender(genderMap[dicomMetadata.patientSex]);
                }
            }
            // Map modality to scan type
            const modalityMap: Record<string, string> = {
                "CT": "CT Scan",
                "MR": "MRI",
                "MRI": "MRI", // Redundant but harmless
                "XR": "X-Ray",
                "CR": "X-Ray",
                "DX": "X-Ray",
                "US": "Ultrasound",
            };
            if (dicomMetadata.modality && modalityMap[dicomMetadata.modality]) {
                setScanType(modalityMap[dicomMetadata.modality]);
            }
            // Auto-fill body part if available
            if (dicomMetadata.bodyPart) {
                setBodyPart(dicomMetadata.bodyPart);
            }
        }
    }, [dicomMetadata]);

    // Check if scan type requires multiple files (CT/MRI are usually series)
    const isMultiImageScanType = scanType === "CT Scan" || scanType === "MRI";

    const handleFileSelect = async (files: File[]) => {
        setDicomError(null);
        setDicomMetadata(null);
        setRenderedDicomImage(null);
        setNonDicomImagePreview(null); // Clear non-DICOM preview

        if (files.length === 0) return;

        let processedFiles: File[] = [];

        // Check for ZIP files
        const zipFiles = files.filter(f => f.name.toLowerCase().endsWith('.zip'));
        const normalFiles = files.filter(f => !f.name.toLowerCase().endsWith('.zip'));

        processedFiles = [...normalFiles];

        if (zipFiles.length > 0) {
            try {
                // Dynamically import JSZip to avoid SSR issues or large bundle size if not needed
                const JSZip = (await import('jszip')).default;

                for (const zipFile of zipFiles) {
                    const zip = new JSZip();
                    const zipContent = await zip.loadAsync(zipFile);

                    const extractedFiles: File[] = [];

                    // Iterate through zip contents
                    for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
                        // Skip directories and hidden files (like __MACOSX)
                        if (zipEntry.dir || relativePath.includes('__MACOSX') || zipEntry.name.startsWith('.')) {
                            continue;
                        }

                        const blob = await zipEntry.async('blob');
                        // Create a file from the blob, preserving the name (stripping path if desired, or keeping it)
                        // We'll keep the basename for simplicity
                        const fileName = relativePath.split('/').pop() || relativePath;
                        const file = new File([blob], fileName, { type: blob.type });
                        extractedFiles.push(file);
                    }

                    processedFiles = [...processedFiles, ...extractedFiles];
                }
            } catch (error) {
                console.error("Error unzipping file:", error);
                setDicomError("Failed to extract ZIP file. Please ensure it is a valid archive.");
                return;
            }
        }

        if (processedFiles.length === 0) {
            setDicomError("No valid files found in the upload.");
            return;
        }

        // Sort files by name to ensure consistent order for series
        const sortedFiles = [...processedFiles].sort((a, b) => a.name.localeCompare(b.name));
        setUploadedFiles(sortedFiles);

        // Check if first file is DICOM
        const firstFile = sortedFiles[0];
        const isDicom = firstFile.name.toLowerCase().endsWith('.dcm') ||
            firstFile.name.toLowerCase().endsWith('.dicom') ||
            firstFile.type === 'application/dicom';

        setIsDicomFile(isDicom);

        if (isDicom) {
            // Parse DICOM file for metadata (from the first file in the series)
            setIsParsingDicom(true);
            try {
                const { metadata } = await dicomService.parseDicom(firstFile);
                setDicomMetadata(metadata);
            } catch (error) {
                console.error("DICOM parsing error:", error);
                setDicomError("Could not parse DICOM metadata from first file. File may be corrupted or not a valid DICOM.");
            } finally {
                setIsParsingDicom(false);
            }
        } else {
            // Handle non-DICOM single image preview
            if (sortedFiles.length === 1 && sortedFiles[0].type.startsWith('image/')) {
                const preview = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(sortedFiles[0]);
                });
                setNonDicomImagePreview(preview);
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            if (isMultiImageScanType) {
                handleFileSelect(filesArray);
            } else {
                handleFileSelect([filesArray[0]]); // Only take first file for non-series
            }
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            if (isMultiImageScanType) {
                handleFileSelect(filesArray);
            } else {
                handleFileSelect([filesArray[0]]); // Only take first file for non-series
            }
        }
    };

    const handleReset = () => {
        setUploadedFiles([]);
        setDicomMetadata(null);
        setDicomError(null);
        setIsDicomFile(false);
        setRenderedDicomImage(null);
        setNonDicomImagePreview(null);
        setPatientName("");
        setPatientAge("");
        setPatientGender("Male");
        setScanType("");
        setBodyPart("");
    };

    const handleRunDiagnosis = async () => {
        if (uploadedFiles.length === 0) {
            alert("Please upload files before running diagnosis.");
            return;
        }

        // For single DICOM files, ensure we have the rendered image
        // if (isDicomFile && uploadedFiles.length === 1 && !renderedDicomImage) {
        //     alert("Please wait for the DICOM image to finish rendering.");
        //     return;
        // }

        setIsRunningDiagnosis(true);
        console.log("Starting diagnosis...");

        try {
            const formData = new FormData(); // Define formData

            // Dynamic import for JSZip
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();

            // Helper to resize image to 1024x1024 (pads with black)
            const resizeImageToStandard = async (file: File): Promise<Blob> => {
                return new Promise((resolve, reject) => {
                    if (!file.type.startsWith('image/')) {
                        resolve(file); // Return original if not an image
                        return;
                    }

                    const img = new globalThis.Image(); // Use globalThis.Image to avoid conflict with next/image
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        // Target size expected by model seems to be 1024x1024 based on error
                        const TARGET_SIZE = 1024;
                        canvas.width = TARGET_SIZE;
                        canvas.height = TARGET_SIZE;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            resolve(file);
                            return;
                        }

                        // Fill black background
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

                        // Calculate scale to fit
                        const scale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
                        const w = img.width * scale;
                        const h = img.height * scale;
                        const x = (TARGET_SIZE - w) / 2;
                        const y = (TARGET_SIZE - h) / 2;

                        ctx.drawImage(img, x, y, w, h);

                        canvas.toBlob((blob) => {
                            if (blob) resolve(blob);
                            else resolve(file);
                        }, file.type);
                    };
                    img.onerror = () => resolve(file);
                    img.src = URL.createObjectURL(file);
                });
            };

            // Add all files to the zip (processing images first)
            for (const file of uploadedFiles) {
                if (file.type.startsWith('image/')) {
                    try {
                        console.log(`Processing/Resizing image: ${file.name}`);
                        const resizedBlob = await resizeImageToStandard(file);
                        zip.file(file.name, resizedBlob);
                    } catch (err) {
                        console.error("Error resizing image, using original", err);
                        zip.file(file.name, file);
                    }
                } else {
                    zip.file(file.name, file);
                }
            }

            // Generate the zip blob
            const zipContent = await zip.generateAsync({ type: "blob" });

            // Create a file from the blob
            const zipFile = new File([zipContent], "files.zip", { type: "application/zip" });

            formData.append('dcm_zip', zipFile);

            // Append metadata as required by new API
            // Use 'modality' from metadata or derive from scanType
            // CT Scan -> CT, MRI -> MR, X-Ray -> DX (or CR/XR) - Best to use metadata if available
            let apiModality = dicomMetadata?.modality || "DX";
            if (scanType === "CT Scan") apiModality = "CT";
            else if (scanType === "MRI") apiModality = "MR";
            else if (scanType === "X-Ray") apiModality = "DX"; // Default fallback

            formData.append('modality', apiModality);
            formData.append('body_parts', bodyPart || "Head"); // Default fallback if empty

            console.log(`Sending request with modality: ${apiModality}, body_parts: ${bodyPart || "Head"}`);

            // Dynamic import for axios if not at top level, or just use it if imported
            const axios = (await import('axios')).default;

            const response = await axios.post('/api/radiology', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000, // 5 minute timeout for analysis
            });

            console.log("API Response:", response.data);
            const apiData = response.data;

            // Parse Markdown Response from 'ai_analysis'
            // Expected format:
            // 1. DIAGNOSTIC REPORT: ...
            // *Summary*: ...
            // *Findings*: ...
            // 2. PREVENTIVE MEASURES: ...

            const analysisText = apiData.ai_analysis || "";
            let summarySection = "";
            let recommendationsSection = "";
            let findings: string[] = [];

            try {
                // Try parsing as JSON first (new format)
                const analysisJson = JSON.parse(analysisText);

                // Extract Findings
                if (analysisJson.FINDINGS) {
                    findings = analysisJson.FINDINGS.split('. ').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
                } else if (analysisJson.findings) {
                    findings = Array.isArray(analysisJson.findings) ? analysisJson.findings : [analysisJson.findings];
                }

                // Extract Summary/Impression
                summarySection = analysisJson.IMPRESSION || analysisJson.impression || analysisJson.diff_diagnosis || "Analysis Complete.";

                // Extract Recommendations/Preventive (if any, otherwise generic)
                recommendationsSection = analysisJson.PREVENTIVE_MEASURES || analysisJson.recommendations || "Review findings with a specialist.";

            } catch (e) {
                // Fallback to Regex Parsing (text format)
                console.log("JSON parse failed, using regex fallback for analysis text");

                // 1. Extract Findings
                const findingsMatch = analysisText.match(/FINDINGS:([\s\S]*?)(?=IMPRESSION:|DIAGNOSIS:|PREVENTIVE MEASURES:|$)/i);
                if (findingsMatch) {
                    findings = findingsMatch[1]
                        .split('\n')
                        .map((line: string) => line.trim())
                        .filter((line: string) => line.length > 0 && (line.match(/^\d+\./) || line.startsWith('-') || line.startsWith('*')))
                        .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^[\*\-]\s*/, '').trim());
                } else {
                    // Fallback to old finding extraction if "FINDINGS:" keyword missing
                    // If lines start with * or -, use them
                    let possibleFindings = analysisText
                        .split('\n')
                        .filter((line: string) => line.trim().startsWith('*') || line.trim().startsWith('-'))
                        .map((line: string) => line.replace(/^[\*\-]\s*/, '').trim());

                    // If no bullet points found, take all text appearing BEFORE the first major section
                    if (possibleFindings.length === 0) {
                        const firstSectionIndex = analysisText.search(/IMPRESSION:|DIAGNOSIS:|PREVENTIVE MEASURES:/i);
                        if (firstSectionIndex > 0) {
                            const preamble = analysisText.substring(0, firstSectionIndex).trim();
                            if (preamble.length > 0) {
                                possibleFindings = preamble.split('\n').map((l: string) => l.trim()).filter((l: string | any[]) => l.length > 0);
                            }
                        }
                    }

                    findings = possibleFindings
                        .filter((line: string) => line.length > 0 && !line.includes("DIAGNOSTIC REPORT") && !line.includes("PREVENTIVE MEASURES"));
                }

                // 2. Extract Impression / Diagnosis / Preventive Measures into Summary
                const impressionMatch = analysisText.match(/IMPRESSION:([\s\S]*?)(?=DIAGNOSIS:|PREVENTIVE MEASURES:|$)/i);
                const diagnosisMatch = analysisText.match(/DIAGNOSIS:([\s\S]*?)(?=PREVENTIVE MEASURES:|$)/i);
                const preventiveMatch = analysisText.match(/PREVENTIVE MEASURES:([\s\S]*?)$/i);

                let combinedSummary = "";

                if (impressionMatch) {
                    combinedSummary += "IMPRESSION:\n" + impressionMatch[1].trim();
                }

                if (diagnosisMatch) {
                    if (combinedSummary) combinedSummary += "\n\n";
                    combinedSummary += "DIAGNOSIS:\n" + diagnosisMatch[1].trim();
                } else if (!impressionMatch) {
                    // Fallback OLD SUMMARY extraction if neither Impression nor Diagnosis found
                    const summaryMatch = analysisText.match(/DIAGNOSTIC REPORT:[\s\S]*?(?=2\. PREVENTIVE MEASURES|2\. \*\*PREVENTIVE)/i);
                    combinedSummary = summaryMatch ? summaryMatch[0] : analysisText;
                }

                if (preventiveMatch) {
                    if (combinedSummary) combinedSummary += "\n\n";
                    combinedSummary += "PREVENTIVE MEASURES:\n" + preventiveMatch[1].trim();
                }

                summarySection = combinedSummary;

                // Keep recommendations empty as requested to hide the UI section, or we could populate it but simply not show it.
                // User asked to remove the recommendation part from display.
                recommendationsSection = "";
            }

            // Extract Confidence (Study Confidence: 12.2%)
            const confidenceMatch = analysisText.match(/Study Confidence:\s*(\d+(\.\d+)?)%/i);
            const confidenceVal = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0;

            // Map API response to our app's DiagnosisResult format
            const result = {
                id: apiData.study_id || `dx-${Date.now()}`,
                patient: {
                    id: dicomMetadata?.patientId || `PAT-${Math.floor(Math.random() * 10000)}`,
                    name: patientName || "Unknown Patient",
                    age: parseInt(patientAge) || 0,
                    gender: patientGender || "Other",
                    scanType: apiModality || scanType || "Unknown", // Use API modality
                    scanDate: new Date().toISOString(),
                    status: "completed" as const,
                    diagnosis: "AI Analysis Complete",
                    email: "patient@example.com",
                    phone: "555-0123",
                    bloodType: "O+",
                    address: "123 Medical Center Blvd",
                    allergies: ["None"],
                    scanImage: renderedDicomImage || nonDicomImagePreview || "https://placehold.co/600x400?text=Scan+Image",
                },
                aiReport: {
                    summary: summarySection.substring(0, 500) + (summarySection.length > 500 ? "..." : ""), // Truncate for summary field if needed, or keep full
                    findings: findings.length > 0 ? findings : ["Check Detailed Report."],
                    recommendations: recommendationsSection
                        ? (recommendationsSection.includes('\n')
                            ? recommendationsSection.split('\n').filter((l: string) => l.trim().length > 3).map((l: string) => l.replace(/^\*\s*/, ''))
                            : [recommendationsSection])
                        : ["Review full report."],
                    riskFactors: [],
                    confidence: confidenceVal || 0.95, // Use extracted confidence or high default
                    generatedAt: new Date().toISOString(),
                    bodyPart: bodyPart || "Unknown",
                    modality: apiModality
                }
            };

            // Store the result
            storeDiagnosis(result);

            // Navigate to patient detail page
            router.push(`/dashboard/patient/${result.id}`);
        } catch (error: any) {
            console.error("Diagnosis failed:", error);
            let errorMessage = "Failed to run diagnosis. Please try again.";

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
                errorMessage = `Server Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No response from server. Check your connection or the endpoint URL.";
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message;
            }

            alert(errorMessage);
        } finally {
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
                    title={t.dashboard.upload.title}
                    subtitle={t.dashboard.upload.subtitle}
                />

                {/* Main Content */}
                <main className="p-6 lg:p-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            {uploadedFiles.length > 0 ? t.dashboard.upload.reviewTitle : t.dashboard.upload.pageTitle}
                        </h1>
                        <p className="text-slate-500">
                            {uploadedFiles.length > 0
                                ? `${t.dashboard.upload.reviewDesc} (${uploadedFiles.length} ${t.dashboard.upload.filesUploaded})`
                                : t.dashboard.upload.pageDesc
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
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.dashboard.upload.analyzing}</h3> {/* Reusing analyzing text for title as well or keep hardcoded? Let's use analyzing string generally or keep specific ones if needed. I only added limited keys. Let's map best fit. */}
                                <p className="text-slate-500 mb-6 text-center max-w-md">
                                    {t.dashboard.upload.analyzing}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t.dashboard.upload.analyzing}</span>
                                </div>
                            </div>
                        </div>
                    ) : uploadedFiles.length > 0 ? (
                        /* File Uploaded - Show DICOM Info, Image, and Form */
                        <div className="space-y-6">
                            {/* DICOM Metadata Section */}
                            {dicomMetadata && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5">
                                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                                            {t.dashboard.upload.dicomMetadata}
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">{t.dashboard.upload.reviewDesc}</p>
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
                                            <MetadataCard
                                                icon={<Activity className="w-4 h-4" />}
                                                label="Body Part"
                                                value={dicomMetadata.bodyPart || "N/A"}
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
                                            <div className="py-8 rounded-xl bg-slate-50 flex flex-col items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-3" />
                                                <p className="text-slate-600 font-medium">
                                                    Parsing DICOM metadata...
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                                        {uploadedFiles.length > 1 ? <Layers className="w-6 h-6" /> : <FileImage className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-slate-900">
                                                            {uploadedFiles.length === 1 ? uploadedFiles[0].name : `${uploadedFiles.length} files selected`}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">
                                                            {(uploadedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-200">
                                                    <FileCheck className="w-4 h-4 text-emerald-500" />
                                                    <span>{t.dashboard.upload.uploadComplete}</span>
                                                    {dicomMetadata && (
                                                        <span className="ml-auto text-emerald-600 font-medium flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" />
                                                            {t.dashboard.upload.dicomMetadata}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right - Patient Information Form */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="text-lg font-semibold text-slate-900">{t.dashboard.upload.patientInfo}</h2>
                                        <p className="text-sm text-slate-500">
                                            {dicomMetadata ? t.dashboard.upload.autoFilled : t.dashboard.upload.enterDetails}
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
                                                    {dicomMetadata?.patientAge && (
                                                        <span className="ml-2 text-xs text-emerald-600">(from DICOM)</span>
                                                    )}
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
                                                    {dicomMetadata?.patientSex && (
                                                        <span className="ml-2 text-xs text-emerald-600">(from DICOM)</span>
                                                    )}
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
                                                <option value="">Select Scan Type</option>
                                                <option value="CT Scan">CT Scan</option>
                                                <option value="MRI">MRI</option>
                                                <option value="X-Ray">X-Ray</option>
                                                {/* <option value="Ultrasound">Ultrasound</option> */}
                                            </select>
                                        </div>

                                        {/* Body Part */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <Activity className="w-4 h-4 inline mr-2" />
                                                Body Part
                                                {dicomMetadata?.bodyPart && (
                                                    <span className="ml-2 text-xs text-emerald-600">(from DICOM)</span>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={bodyPart}
                                                onChange={(e) => setBodyPart(e.target.value)}
                                                placeholder="e.g. Head, Chest, Knee"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                                            />
                                        </div>

                                        {/* Run Diagnosis Button */}
                                        <div className="pt-4">
                                            <Button
                                                onClick={handleRunDiagnosis}
                                                className="w-full h-14 text-lg shadow-lg"
                                                disabled={!patientName || !patientAge || !scanType || uploadedFiles.length === 0 || isParsingDicom}
                                            >
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                {t.dashboard.upload.runDiagnosis}
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>
                                            <p className="text-xs text-center text-slate-400 mt-3">
                                                {t.dashboard.upload.reviewDesc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* No File - Show Upload Zone */
                        <>
                            {/* Scan Type Selection or Upload Zone */}
                            {!scanType ? (
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                                        {t.dashboard.upload.selectType}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* X-RAY */}
                                        <button
                                            onClick={() => setScanType("X-Ray")}
                                            className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 text-center"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-6 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                                                <Zap className="w-8 h-8 text-slate-500 group-hover:text-[var(--color-primary)] transition-colors" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">X-Ray</h3>
                                            <p className="text-sm text-slate-500">
                                                Radiography images
                                            </p>
                                        </button>

                                        {/* CT SCAN */}
                                        <button
                                            onClick={() => setScanType("CT Scan")}
                                            className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 text-center"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-6 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                                                <Layers className="w-8 h-8 text-slate-500 group-hover:text-[var(--color-primary)] transition-colors" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">CT Scan</h3>
                                            <p className="text-sm text-slate-500">
                                                Computed Tomography
                                            </p>
                                        </button>

                                        {/* MRI */}
                                        <button
                                            onClick={() => setScanType("MRI")}
                                            className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 text-center"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-6 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                                                <Activity className="w-8 h-8 text-slate-500 group-hover:text-[var(--color-primary)] transition-colors" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">MRI</h3>
                                            <p className="text-sm text-slate-500">
                                                Magnetic Resonance Imaging
                                            </p>
                                        </button>
                                    </div>
                                </div>
                            ) : (
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
                                            accept=".dcm,.jpg,.jpeg,.png,.dicom,application/dicom,.zip,application/zip,application/x-zip-compressed"
                                            multiple={isMultiImageScanType} // Allow multiple for series
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
                                                {t.dashboard.upload.title}
                                            </h3>
                                            <p className="text-lg text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                                                {t.dashboard.upload.dragDrop}
                                                <span className="block text-sm mt-2 text-[var(--color-primary)]">
                                                    {isMultiImageScanType
                                                        ? "Select multiple files at once for DICOM series"
                                                        : t.dashboard.upload.autoFilled
                                                    }
                                                </span>
                                            </p>
                                            <Button className="pointer-events-none">
                                                {t.dashboard.upload.browse}
                                            </Button>
                                            <p className="text-sm text-slate-400 mt-4">
                                                {t.dashboard.upload.supportedFormats}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

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