import React, { useState } from "react";
import { DicomMetadata } from "../services/dicomService";
import { Activity, Database, User, Calendar, FileText, ChevronDown, ChevronRight, List } from "lucide-react";
import { Button } from "./ui/Button";
import { DicomViewer } from "./DicomViewer";

interface AnalysisResultProps {
    metadata: DicomMetadata;
    fullTags?: any;
    imageFile: File | null;
    onReset: () => void;
}

export function AnalysisResult({ metadata, fullTags, imageFile, onReset }: AnalysisResultProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any | null>(null);
    const [showFullTags, setShowFullTags] = useState(false);

    const handleRunDiagnostics = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        try {
            const { aiService } = await import("../services/aiService");
            const result = await aiService.analyzeScan(imageFile, metadata);
            setAnalysis(result);
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Analysis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to safely render tag values
    const renderTagValue = (value: any) => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return String(value);
    };

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
            <div className="flex flex-col lg:flex-row gap-8 mb-8">

                {/* Left Column: Image Viewer */}
                <div className="w-full lg:w-2/3 glass-dark rounded-3xl p-4 border border-slate-700/50 shadow-2xl">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[var(--color-primary)]" />
                            Scan Preview
                        </h3>
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                            {metadata.modality}
                        </span>
                    </div>

                    <div className="relative aspect-square sm:aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 group">
                        <DicomViewer file={imageFile} />
                    </div>
                </div>

                {/* Right Column: Metadata & AI Actions */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="glass rounded-3xl p-6 border border-white/50 shadow-xl">
                        <h3 className="text-slate-800 font-bold text-lg mb-6 flex items-center gap-2">
                            <Database className="w-5 h-5 text-[var(--color-primary)]" />
                            Digital Markers
                        </h3>

                        <div className="space-y-4">
                            <MetadataItem
                                icon={<User className="w-4 h-4" />}
                                label="Patient Identity"
                                value={metadata.patientName}
                                subValue={metadata.patientId}
                            />
                            <div className="h-px bg-slate-100"></div>
                            <MetadataItem
                                icon={<Calendar className="w-4 h-4" />}
                                label="Study Date"
                                value={metadata.studyDate}
                            />
                            <div className="h-px bg-slate-100"></div>
                            <MetadataItem
                                icon={<FileText className="w-4 h-4" />}
                                label="Description"
                                value={metadata.studyDescription}
                                subValue={metadata.manufacturer}
                            />
                        </div>
                    </div>

                    {!analysis ? (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

                            <h3 className="font-bold text-lg mb-2">AI Analysis</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Send this scan to our FastAI neural network for anomaly detection.
                            </p>

                            <Button
                                className="w-full shadow-lg shadow-teal-500/20"
                                variant="primary"
                                onClick={handleRunDiagnostics}
                                isLoading={isLoading}
                            >
                                {isLoading ? "Processing..." : "Run Diagnostics"}
                            </Button>
                            <Button onClick={onReset} className="w-full mt-3 text-slate-400 hover:text-white" variant="ghost" size="sm">
                                Upload New Scan
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500 border border-teal-500/30">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/30 rounded-full blur-3xl -mr-10 -mt-10"></div>

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-teal-50">Results Ready</h3>
                                <span className="text-xs font-bold bg-teal-500 text-white px-2 py-1 rounded-full">{Math.round(analysis.confidence * 100)}% Conf.</span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <p className="text-xs text-teal-200/70 uppercase tracking-wide">Diagnosis</p>
                                    <p className="font-semibold text-xl">{analysis.analysis}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-teal-200/70 uppercase tracking-wide">Findings</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{analysis.finding}</p>
                                </div>
                            </div>

                            <Button onClick={onReset} className="w-full bg-white/10 hover:bg-white/20 text-white border-none" variant="outline" size="sm">
                                Start New Analysis
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* detailed tags section */}
            {fullTags && (
                <div className="w-full">
                    <button
                        onClick={() => setShowFullTags(!showFullTags)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-4 transition-colors"
                    >
                        {showFullTags ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        <List className="w-4 h-4" />
                        View All Extracted DICOM Tags
                    </button>

                    {showFullTags && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Tag Name</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {Object.entries(fullTags).map(([key, value]) => {
                                            // Filter out very large objects or binary data ideally
                                            if (key === 'PixelData' || key === '_vrMap') return null;

                                            return (
                                                <tr key={key} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-3 font-medium text-slate-600 font-mono">{key}</td>
                                                    <td className="px-6 py-3 text-slate-500 max-w-xl truncate" title={String(value)}>
                                                        {renderTagValue(value)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MetadataItem({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue?: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="font-medium text-slate-800">{value}</p>
                {subValue && <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>}
            </div>
        </div>
    )
}
