"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface DicomViewerProps {
    file: File;
    className?: string;
    onImageRendered?: (imageDataUrl: string) => void;
}

export function DicomViewer({ file, className = "", onImageRendered }: DicomViewerProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize Cornerstone
    useEffect(() => {
        let mounted = true;

        const initCornerstone = async () => {
            try {
                if (typeof window === "undefined") return;

                // Dynamic imports to avoid SSR issues
                const cornerstone = (await import("cornerstone-core")).default;
                const cornerstoneWADOImageLoader = (await import("cornerstone-wado-image-loader")) as any;
                const dicomParser = (await import("dicom-parser")).default;
                
                // Configure WADO Image Loader
                cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
                cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

                // Configure Web Workers
                try {
                    const config = {
                        maxWebWorkers: navigator.hardwareConcurrency || 1,
                        startWebWorkersOnDemand: true,
                        taskConfiguration: {
                            decodeTask: {
                                initializeCodecsOnStartup: false,
                                usePDFJS: false,
                                strict: false,
                            },
                        },
                        webWorkerPath: "/workers/cornerstoneWADOImageLoaderWebWorker.min.js",
                    };
                    if (!cornerstoneWADOImageLoader.webWorkerManager.isInitialized) {
                        cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
                    }
                } catch (workerError) {
                    console.warn("Web workers could not be configured:", workerError);
                }

                if (mounted) {
                    setIsInitialized(true);
                }
            } catch (err) {
                console.error("Failed to initialize Cornerstone:", err);
                if (mounted) setError("Failed to initialize DICOM viewer");
            }
        };

        if (!isInitialized) {
            initCornerstone();
        }

        return () => {
            mounted = false;
        };
    }, [isInitialized]);

    // Render Image
    useEffect(() => {
        let imageId: string | null = null;
        let mounted = true;

        const renderImage = async () => {
            if (!file || !elementRef.current || !isInitialized) return;

            setIsLoading(true);
            setError(null);

            try {
                const cornerstone = (await import("cornerstone-core")).default;
                const cornerstoneWADOImageLoader = (await import("cornerstone-wado-image-loader")) as any;

                const element = elementRef.current;
                cornerstone.enable(element);

                // Clear any previous files from the manager
                cornerstoneWADOImageLoader.wadouri.fileManager.purge();
                
                // Add file to WADO file manager
                imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

                if (!imageId) throw new Error("Failed to create image ID");

                const image = await cornerstone.loadImage(imageId);

                if (mounted) {
                    cornerstone.displayImage(element, image);

                    // Capture the rendered image as PNG base64 for storage
                    if (onImageRendered) {
                        // Wait a bit for the image to be fully rendered
                        setTimeout(() => {
                            try {
                                const canvas = element.querySelector('canvas');
                                if (canvas) {
                                    const imageDataUrl = canvas.toDataURL('image/png');
                                    onImageRendered(imageDataUrl);
                                }
                            } catch (captureError) {
                                console.error("Failed to capture rendered image:", captureError);
                            }
                        }, 100);
                    }

                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Cornerstone render error:", err);
                if (mounted) {
                    setError(err instanceof Error ? err.message : "Failed to load DICOM image");
                    setIsLoading(false);
                }
            }
        };

        if (isInitialized && file) {
            renderImage();
        }

        return () => {
            mounted = false;
        };
    }, [file, isInitialized, onImageRendered]);

    return (
        <div className={`relative bg-black select-none overflow-hidden ${className}`}>
            <div
                ref={elementRef}
                className="w-full h-full"
                style={{ width: "100%", height: "100%" }}
                onContextMenu={(e) => e.preventDefault()}
            />

            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                    <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
                    <p className="text-white font-medium">Loading Scan...</p>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <p className="text-red-400 font-medium mb-1">Error Loading Image</p>

                    <p className="text-sm text-slate-400 max-w-xs">{error}</p>
                </div>
            )}
        </div>
    );
}
