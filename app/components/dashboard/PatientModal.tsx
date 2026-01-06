"use client";

import React from "react";
import { X, User, Calendar, FileText, Activity, Phone, Mail, MapPin, Heart, ClipboardList } from "lucide-react";
import { Button } from "../ui/Button";

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    scanType: string;
    scanDate: string;
    status: "completed" | "pending" | "critical";
    diagnosis: string;
    // Extended details
    email?: string;
    phone?: string;
    address?: string;
    bloodType?: string;
    allergies?: string[];
    notes?: string;
}

interface PatientModalProps {
    patient: Patient | null;
    isOpen: boolean;
    onClose: () => void;
}

const statusConfig = {
    completed: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        label: "Completed",
    },
    pending: {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        label: "Pending",
    },
    critical: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        label: "Critical",
    },
};

export function PatientModal({ patient, isOpen, onClose }: PatientModalProps) {
    if (!isOpen || !patient) return null;

    const status = statusConfig[patient.status];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-6 py-8 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{patient.name}</h2>
                                <p className="text-white/80">Patient ID: {patient.id}</p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute bottom-4 right-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm`}>
                                {status.label}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <InfoCard icon={<Calendar className="w-4 h-4" />} label="Age" value={`${patient.age} years`} />
                            <InfoCard icon={<User className="w-4 h-4" />} label="Gender" value={patient.gender} />
                            <InfoCard icon={<Heart className="w-4 h-4" />} label="Blood Type" value={patient.bloodType || "A+"} />
                            <InfoCard icon={<FileText className="w-4 h-4" />} label="Scan Type" value={patient.scanType} />
                        </div>

                        {/* Contact Information */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact Information</h3>
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span>{patient.email || `${patient.name.toLowerCase().replace(' ', '.')}@email.com`}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{patient.phone || "+91 98765 43210"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{patient.address || "Mumbai, Maharashtra, India"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Scan Details */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Scan Information</h3>
                            <div className={`rounded-xl p-4 border ${status.border} ${status.bg}`}>
                                <div className="flex items-start gap-3">
                                    <Activity className={`w-5 h-5 mt-0.5 ${status.color}`} />
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Diagnosis</p>
                                        <p className="text-slate-600">{patient.diagnosis}</p>
                                        <p className="text-sm text-slate-500 mt-2">
                                            Scan Date: {new Date(patient.scanDate).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medical Notes */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Medical Notes</h3>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <ClipboardList className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-slate-600">
                                            {patient.notes || "Patient underwent routine scan. No immediate concerns noted. Follow-up recommended in 6 months for monitoring."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Allergies */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Known Allergies</h3>
                            <div className="flex flex-wrap gap-2">
                                {(patient.allergies || ["Penicillin", "Iodine Contrast"]).map((allergy, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100"
                                    >
                                        {allergy}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button>
                            Download Report
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                {icon}
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <p className="font-semibold text-slate-900">{value}</p>
        </div>
    );
}
