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
    Layers,
    Zap,
    Play
} from "lucide-react";
import { runAIDiagnosis, storeDiagnosis, PatientInfo } from "../../services/aiDiagnosisService";
import { dicomService, DicomMetadata } from "../../services/dicomService";
import { DicomViewer } from "../../components/dashboard/DicomViewer";

export default function UploadPage() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isRunningDiagnosis, setIsRunningDiagnosis] = useState(false);
    const [isParsingDicom, setIsParsingDicom] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessingVideo, setIsProcessingVideo] = useState(false);
    const [videoBase64, setVideoBase64] = useState<string | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

    // DICOM metadata
    const [dicomMetadata, setDicomMetadata] = useState<DicomMetadata | null>(null);
    const [dicomError, setDicomError] = useState<string | null>(null);
    const [isDicomFile, setIsDicomFile] = useState(false);
    const [renderedDicomImage, setRenderedDicomImage] = useState<string | null>(null);

    // Patient info form state - auto-filled from DICOM when available
    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    const [patientGender, setPatientGender] = useState("Male");
    const [scanType, setScanType] = useState("");

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

    // Helper function to convert images to video for CT/MRI
    const generateVideoFromImages = async (files: File[]): Promise<{ base64: string; previewUrl: string }> => {
        return new Promise(async (resolve, reject) => {
            try {
                // Sort files by name to ensure correct order
                const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

                // Load all images first
                const loadImage = (file: File): Promise<HTMLImageElement> => {
                    return new Promise((res, rej) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = new window.Image();
                            img.onload = () => res(img);
                            img.onerror = rej;
                            img.src = e.target?.result as string;
                        };
                        reader.onerror = rej;
                        reader.readAsDataURL(file);
                    });
                };

                const images = await Promise.all(sortedFiles.map(loadImage));

                if (images.length === 0) {
                    reject(new Error("No images to process"));
                    return;
                }

                // Create canvas with first image dimensions
                const canvas = document.createElement('canvas');
                canvas.width = images[0].width || 512;
                canvas.height = images[0].height || 512;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Set up MediaRecorder
                const stream = canvas.captureStream(30); // 30 fps
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 2500000
                });

                const chunks: Blob[] = [];
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    // Create preview URL
                    const previewUrl = URL.createObjectURL(blob);
                    // Convert to base64
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            base64: reader.result as string,
                            previewUrl: previewUrl
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                };

                // Start recording
                mediaRecorder.start();

                // Draw each image frame with delay
                const frameDelay = 200; // 200ms per frame (5 fps effective display)
                for (let i = 0; i < images.length; i++) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(images[i], 0, 0, canvas.width, canvas.height);
                    await new Promise(r => setTimeout(r, frameDelay));
                }

                // Stop recording after last frame
                await new Promise(r => setTimeout(r, 500)); // Extra time for last frame
                mediaRecorder.stop();
            } catch (error) {
                reject(error);
            }
        });
    };

    // Check if scan type requires multiple files
    const isMultiImageScan = scanType === "CT Scan" || scanType === "MRI";

    const handleFileSelect = async (files: File[]) => {
        // Clean up old video preview URL
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
        }

        setDicomError(null);
        setDicomMetadata(null);
        setImagePreview(null);
        setImagePreviews([]);
        setVideoBase64(null);
        setVideoPreviewUrl(null);

        if (files.length === 0) return;

        // Sort files by name
        const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
        setUploadedFiles(sortedFiles);

        // Check if first file is DICOM
        const firstFile = sortedFiles[0];
        const isDicom = firstFile.name.toLowerCase().endsWith('.dcm') ||
            firstFile.name.toLowerCase().endsWith('.dicom') ||
            firstFile.type === 'application/dicom';

        setIsDicomFile(isDicom);

        if (isDicom) {
            // Parse DICOM file for metadata
            setIsParsingDicom(true);
            try {
                const { metadata } = await dicomService.parseDicom(firstFile);
                setDicomMetadata(metadata);
            } catch (error) {
                console.error("DICOM parsing error:", error);
                setDicomError("Could not parse DICOM metadata. File may be corrupted.");
            } finally {
                setIsParsingDicom(false);
            }
        } else {
            // Regular image files - create previews
            const previews: string[] = [];
            for (const file of sortedFiles.slice(0, 4)) { // Show up to 4 previews
                if (file.type.startsWith('image/')) {
                    const preview = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.readAsDataURL(file);
                    });
                    previews.push(preview);
                }
            }
            setImagePreviews(previews);
            if (previews.length > 0) {
                setImagePreview(previews[0]);
            }

            // For multi-image CT/MRI, generate video preview automatically
            if (isMultiImageScan && sortedFiles.length > 1) {
                setIsProcessingVideo(true);
                try {
                    const videoResult = await generateVideoFromImages(sortedFiles);
                    setVideoBase64(videoResult.base64);
                    setVideoPreviewUrl(videoResult.previewUrl);
                } catch (error) {
                    console.error("Video preview generation failed:", error);
                    // Don't show error - preview will just show images instead
                } finally {
                    setIsProcessingVideo(false);
                }
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            if (isMultiImageScan) {
                handleFileSelect(filesArray);
            } else {
                handleFileSelect([filesArray[0]]);
            }
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            if (isMultiImageScan) {
                handleFileSelect(filesArray);
            } else {
                handleFileSelect([filesArray[0]]);
            }
        }
    };

    const handleReset = () => {
        // Revoke video preview URL to free memory
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
        }
        setUploadedFiles([]);
        setImagePreview(null);
        setImagePreviews([]);
        setDicomMetadata(null);
        setDicomError(null);
        setIsDicomFile(false);
        setRenderedDicomImage(null);
        setVideoBase64(null);
        setVideoPreviewUrl(null);
        setPatientName("");
        setPatientAge("");
        setPatientGender("Male");
        setScanType("");
    };

    const handleRunDiagnosis = async () => {
        if (uploadedFiles.length === 0 || !patientName || !patientAge) {
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

            let mediaBase64: string | undefined;

            // For CT/MRI with multiple images, use already generated video or generate new one
            if (isMultiImageScan && uploadedFiles.length > 1 && !isDicomFile) {
                // If video was already generated during upload, use it
                if (videoBase64) {
                    mediaBase64 = videoBase64;
                } else {
                    // Generate video if not already done
                    setIsProcessingVideo(true);
                    try {
                        const videoResult = await generateVideoFromImages(uploadedFiles);
                        mediaBase64 = videoResult.base64;
                        setVideoBase64(videoResult.base64);
                        setVideoPreviewUrl(videoResult.previewUrl);
                    } catch (error) {
                        console.error("Video generation failed:", error);
                        alert("Failed to generate video from images. Using first image instead.");
                        // Fallback to first image
                        mediaBase64 = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target?.result as string);
                            reader.readAsDataURL(uploadedFiles[0]);
                        });
                    } finally {
                        setIsProcessingVideo(false);
                    }
                }
            } else if (isDicomFile) {
                mediaBase64 = renderedDicomImage || undefined;
            }

            // Run AI diagnosis
            const result = await runAIDiagnosis(
                uploadedFiles[0],
                patientInfo,
                mediaBase64
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
                            {uploadedFiles.length > 0 ? "Review & Analyze Scan" : "Upload Medical Scan"}
                        </h1>
                        <p className="text-slate-500">
                            {uploadedFiles.length > 0
                                ? `Review extracted information and run AI-powered diagnosis (${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded)`
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
                    ) : uploadedFiles.length > 0 ? (
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
                                        {isParsingDicom || isProcessingVideo ? (
                                            <div className="aspect-square rounded-xl bg-slate-100 flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
                                                <p className="text-slate-600 font-medium">
                                                    {isParsingDicom ? "Parsing DICOM file..." : "Generating video preview..."}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {isParsingDicom ? "Extracting metadata and image" : "Converting image sequence to video"}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className={`relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-4 ${videoPreviewUrl ? 'cursor-pointer group' : ''}`}
                                                    onClick={() => videoPreviewUrl && setShowVideoModal(true)}
                                                >
                                                    {isDicomFile && uploadedFiles.length > 0 ? (
                                                        // Render actual DICOM image and capture as PNG
                                                        <DicomViewer
                                                            file={uploadedFiles[0]}
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

                                                    {/* Gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />

                                                    {/* Play button overlay for video */}
                                                    {videoPreviewUrl && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                                                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                                <Play className="w-8 h-8 text-slate-800 ml-1" fill="currentColor" />
                                                            </div>
                                                            <span className="absolute bottom-20 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                                                                Click to preview video
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="absolute bottom-4 left-4 text-white z-10">
                                                        <p className="text-sm font-medium">
                                                            {uploadedFiles.length === 1
                                                                ? uploadedFiles[0].name
                                                                : `${uploadedFiles.length} files selected`
                                                            }
                                                        </p>
                                                        <p className="text-xs text-white/70">
                                                            {(uploadedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <FileCheck className="w-4 h-4 text-emerald-500" />
                                                    <span>
                                                        {videoPreviewUrl
                                                            ? "Video preview ready - click image to play"
                                                            : "File uploaded successfully"
                                                        }
                                                    </span>
                                                    {dicomMetadata && (
                                                        <span className="ml-auto text-[var(--color-primary)] font-medium">
                                                            DICOM Parsed ✓
                                                        </span>
                                                    )}
                                                    {videoPreviewUrl && (
                                                        <span className="ml-auto text-emerald-500 font-medium">
                                                            Video Generated ✓
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
                            {/* Scan Type Selection or Upload Zone */}
                            {!scanType ? (
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                                        Select the type of scan to upload
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
                                            accept=".dcm,.jpg,.jpeg,.png,.dicom,application/dicom"
                                            multiple={isMultiImageScan}
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
                                                Upload {scanType} {isMultiImageScan ? "Image Sequence" : "Scan"}
                                            </h3>
                                            <p className="text-lg text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                                                {isMultiImageScan
                                                    ? `Select all slices/images in your ${scanType} sequence. They will be converted to video for AI analysis.`
                                                    : `Drag and drop your ${scanType} scan here.`
                                                }
                                                <span className="block text-sm mt-2 text-[var(--color-primary)]">
                                                    {isMultiImageScan
                                                        ? "Select multiple files at once for best results"
                                                        : "DICOM files will auto-extract patient metadata!"
                                                    }
                                                </span>
                                            </p>
                                            <Button className="pointer-events-none">
                                                {isMultiImageScan ? "Select Multiple Files" : "Browse Files"}
                                            </Button>
                                            <p className="text-sm text-slate-400 mt-4">
                                                Supported formats: .dcm, .dicom, .jpg, .png
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

            {/* Video Preview Modal */}
            {showVideoModal && videoPreviewUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowVideoModal(false)}
                >
                    <div
                        className="relative max-w-4xl w-full mx-4 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Video Preview</h3>
                                <p className="text-sm text-slate-400">
                                    {uploadedFiles.length} images converted to video
                                </p>
                            </div>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Video Player */}
                        <div className="relative aspect-video bg-black">
                            <video
                                src={videoPreviewUrl}
                                className="w-full h-full object-contain"
                                controls
                                autoPlay
                                loop
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-800/50 flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                                This video will be sent to the AI for analysis
                            </p>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
