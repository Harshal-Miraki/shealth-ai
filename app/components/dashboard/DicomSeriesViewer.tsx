"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, AlertCircle, Play, Pause, Rewind, FastForward, Film } from "lucide-react";

// Define Cornerstone types in a global scope for dynamic imports
let cornerstone: any;
let cornerstoneWADOImageLoader: any;
let dicomParser: any;

interface DicomSeriesViewerProps {
    files: File[];
    className?: string;
}

export function DicomSeriesViewer({ files, className = "" }: DicomSeriesViewerProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [imageIds, setImageIds] = useState<string[]>([]);
    const [stack, setStack] = useState<any>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Initialize Cornerstone Libraries
    useEffect(() => {
        let mounted = true;

        const initCornerstone = async () => {
            try {
                if (typeof window === "undefined") return;

                cornerstone = (await import("cornerstone-core")).default;
                cornerstoneWADOImageLoader = (await import("cornerstone-wado-image-loader")).default;
                dicomParser = (await import("dicom-parser")).default;
                const Hammer = (await import("hammerjs")).default; // For touch controls

                cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
                cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
                
                // Configure Web Workers
                const webWorkerConfig = {
                    maxWebWorkers: navigator.hardwareConcurrency || 4,
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
                
                // This check prevents re-initialization errors on hot-reloads
                if (!cornerstoneWADOImageLoader.webWorkerManager.isInitialized) {
                    cornerstoneWADOImageLoader.webWorkerManager.initialize(webWorkerConfig);
                }
                
                if (mounted) setIsInitialized(true);
            } catch (err) {
                console.error("Failed to initialize Cornerstone:", err);
                if (mounted) setError("Failed to initialize DICOM viewer.");
            }
        };

        if (!isInitialized) {
            initCornerstone();
        }

        return () => {
            mounted = false;
            if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
        };
    }, [isInitialized]);

    // 2. Load Files into Image IDs
    useEffect(() => {
        if (!isInitialized || !files || files.length === 0) return;
        
        // Important: Clear old files from the manager to prevent memory leaks
        try {
            cornerstoneWADOImageLoader.wadouri.fileManager.purge();
        } catch(e) {
            // Can ignore if it fails (e.g. on first load)
        }
        
        const loadedImageIds = files.map(file => 
            cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
        );

        setImageIds(loadedImageIds);
        setCurrentImageIndex(0); // Reset to first image on new files
        setIsLoading(true);
        setError(null);

    }, [files, isInitialized]);

    // 3. Create Stack and Display First Image
    useEffect(() => {
        let mounted = true;
        
        const loadAndDisplayImage = async () => {
            if (!isInitialized || imageIds.length === 0 || !elementRef.current) return;
            
            const element = elementRef.current;
            cornerstone.enable(element);

            const newStack = {
                currentImageIdIndex: 0,
                imageIds: imageIds,
            };

            try {
                const image = await cornerstone.loadImage(imageIds[0]);
                if (mounted) {
                    cornerstone.displayImage(element, image);
                    
                    // Add stack state and tools for interaction
                    const cornerstoneTools = (await import("cornerstone-tools")).default;
                    const Hammer = (await import("hammerjs")).default;
                    cornerstoneTools.external.cornerstone = cornerstone;
                    cornerstoneTools.external.Hammer = Hammer; // Bind Hammer.js for touch/mouse input
                    
                    // Initialize tools if not already done
                    try {
                      cornerstoneTools.init();
                    } catch(e) { /* ignore re-init error */ }

                    cornerstoneTools.addStackStateManager(element, ["stack"]);
                    cornerstoneTools.addToolState(element, "stack", newStack);
                    
                    // Optional: Enable mouse/touch controls
                    cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
                    cornerstoneTools.setToolActive(element, "StackScrollMouseWheel", { mouseButtonMask: 1 });

                    setStack(newStack);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Cornerstone load image error:", err);
                if (mounted) {
                    setError(err instanceof Error ? err.message : "Failed to load DICOM series.");
                    setIsLoading(false);
                }
            }
        };

        if (imageIds.length > 0) {
            loadAndDisplayImage();
        }

        return () => {
            mounted = false;
        };
    }, [imageIds, isInitialized]);

    // 4. Function to display a specific image in the stack
    const displayImageByIndex = useCallback((index: number) => {
        if (!stack || index < 0 || index >= stack.imageIds.length || !elementRef.current) return;

        const element = elementRef.current;
        const imageId = stack.imageIds[index];
        cornerstone.enable(element);

        cornerstone.loadImage(imageId).then((image: any) => {
            cornerstone.displayImage(element, image);
            setCurrentImageIndex(index);
        }).catch((err: Error) => {
            console.error(`Failed to load image at index ${index}:`, err);
            setError(`Could not load frame ${index + 1}`);
        });
    }, [stack]);

    // 5. Playback Logic
    useEffect(() => {
        if (isPlaying && stack) {
            playbackIntervalRef.current = setInterval(() => {
                setCurrentImageIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % stack.imageIds.length;
                    displayImageByIndex(nextIndex);
                    return nextIndex;
                });
            }, 100); // 10 FPS
        } else if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
        }
        return () => {
            if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
        };
    }, [isPlaying, stack, displayImageByIndex]);


    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newIndex = parseInt(e.target.value, 10);
        displayImageByIndex(newIndex);
    };
    
    return (
        <div className={`relative bg-black select-none overflow-hidden rounded-lg shadow-xl ${className}`}>
            <div
                ref={elementRef}
                className="w-full h-full"
                onContextMenu={(e) => e.preventDefault()}
            />

            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                    <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
                    <p className="text-white font-medium">Loading Scan Series...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 z-10 p-4 text-center">
                    <AlertCircle className="w-10 h-10 text-white mb-3" />
                    <p className="text-white font-medium mb-1">Error Loading Series</p>
                    <p className="text-sm text-red-200 max-w-xs">{error}</p>
                </div>
            )}

            {!isLoading && !error && stack && files.length > 1 && (
                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
                    <div className="flex items-center gap-4 text-white">
                        {/* Play/Pause Button */}
                        <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-[var(--color-primary)] transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>

                        {/* Slider */}
                        <div className="flex-1 flex items-center gap-3">
                            <Film className="w-5 h-5 opacity-70" />
                            <input
                                type="range"
                                min="0"
                                max={stack.imageIds.length - 1}
                                value={currentImageIndex}
                                onChange={handleSliderChange}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                            />
                        </div>

                        {/* Frame Counter */}
                        <div className="text-sm font-mono bg-black/50 px-2 py-1 rounded">
                            {currentImageIndex + 1} / {stack.imageIds.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
