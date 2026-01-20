import React, { useEffect, useRef, useState } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

// Configure WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// Usually we need to set web worker paths, but for client-side file rendering
// we might get away with default or synchronous decoding for simple use cases.
// For production, we SHOULD copy the workers to /public and set paths.
// cornerstoneWADOImageLoader.webWorkerManager.initialize({
//   maxWebWorkers: navigator.hardwareConcurrency || 1,
//   startWebWorkersOnDemand: true,
//   taskConfiguration: {
//     decodeTask: {
//       initializeCodecsOnStartup: false,
//     },
//   },
// });

interface DicomViewerProps {
    file: File | null;
}

export function DicomViewer({ file }: DicomViewerProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [imageId, setImageId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            try {
                cornerstone.enable(element);
            } catch (err) {
                console.warn("Cornerstone enable warning:", err);
            }
        }

        return () => {
            // Cleanup NOT strictly necessary for cornerstone-core enabled elements in React 
            // as DOM removal handles most, but good practice if available.
        };
    }, []);

    useEffect(() => {
        if (!file || !elementRef.current) return;

        const loadDicom = async () => {
            try {
                // Remove previous image from cache if exists (optional, simply adding new one works)
                const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                setImageId(imageId);

                const image = await cornerstone.loadImage(imageId);

                if (elementRef.current) {
                    cornerstone.displayImage(elementRef.current, image);

                    // Simple "fit to window" logic
                    cornerstone.resize(elementRef.current, true);
                }
            } catch (err: any) {
                console.error("Error loading DICOM:", err);
                setError(err.message || "Failed to load DICOM image.");
            }
        };

        loadDicom();

    }, [file]);

    return (
        <div className="w-full h-full bg-black relative rounded-2xl overflow-hidden group">
            <div
                ref={elementRef}
                className="w-full h-full"
                onContextMenu={(e) => e.preventDefault()}
            />

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-500 p-4 text-center">
                    <p>{error}</p>
                </div>
            )}

            <div className="absolute top-4 left-4 text-xs text-white/50 space-y-1 font-mono pointer-events-none">
                <p>Cornerstone.js</p>
                <p>{file?.name}</p>
            </div>

            {/* Simple Controls Overlay (Visual Only for now) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-slate-800/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
                    W/L: Auto
                </span>
                <span className="bg-slate-800/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
                    Zoom: 100%
                </span>
            </div>
        </div>
    );
}
