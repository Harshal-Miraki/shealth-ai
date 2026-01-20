"use client";

import React, { useState, useCallback } from "react";
import { UploadCloud, File, X, CheckCircle } from "lucide-react";
import { Button } from "./ui/Button";

interface UploadZoneProps {
    onFileSelected?: (file: File) => void;
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        // Simple file handling for Phase 1 (First file only)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            if (onFileSelected) {
                onFileSelected(selectedFile);
            }
        }
    }, [onFileSelected]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (onFileSelected) {
                onFileSelected(selectedFile);
            }
        }
    };

    const removeFile = () => setFile(null);

    if (file) {
        return (
            <div className="w-full max-w-2xl mx-auto p-1 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-3xl shadow-2xl shadow-teal-500/20">
                <div className="bg-white rounded-[22px] p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-20"></div>

                    <div className="w-20 h-20 bg-teal-50 mx-auto rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-[var(--color-primary)]" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to Analyze</h3>
                    <p className="text-slate-500 mb-8">{file.name}</p>

                    <div className="flex gap-4 justify-center">
                        <Button variant="ghost" onClick={removeFile} className="text-slate-500 hover:text-red-500">Replace</Button>
                        <Button size="lg" className="px-10 shadow-xl shadow-teal-500/30">
                            Analyze Scan
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative w-full max-w-2xl mx-auto rounded-3xl border-[3px] border-dashed transition-all duration-300 group cursor-pointer
        ${isDragging
                    ? "border-[var(--color-primary)] bg-teal-50/50 scale-102 shadow-2xl shadow-teal-500/10"
                    : "border-slate-200 bg-white/50 hover:border-[var(--color-primary)]/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40"
                }
      `}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileSelect}
                accept=".dcm,.jpg,.png"
            />

            <div className="p-12 md:p-16 text-center flex flex-col items-center justify-center">
                <div className={`
            w-24 h-24 mb-6 rounded-full flex items-center justify-center transition-all duration-300
            ${isDragging ? "bg-[var(--color-primary)] text-white scale-110" : "bg-slate-100 text-slate-400 group-hover:text-[var(--color-primary)] group-hover:bg-teal-50"}
        `}>
                    <UploadCloud className="w-12 h-12" />
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    Upload Medical Scans
                </h3>
                <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Drag and drop your XRAY, MRI, or CT scans here.
                    <span className="block text-sm mt-2 opacity-70">Supported formats: .dcm, .jpg, .png</span>
                </p>

                <Button className="pointer-events-none">
                    Browse Files
                </Button>
            </div>
        </div>
    );
}
