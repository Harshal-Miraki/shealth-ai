"use client";

import React, { useState } from "react";
import {
    User,
    Settings,
    Bell,
    Shield,
    Moon,
    Sun,
    Monitor,
    Smartphone,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Check,
    LogOut,
    ChevronRight,
    Globe
} from "lucide-react";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";

export default function SettingsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    // Mock State for Settings
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        weeklyDigest: true,
        updates: true
    });

    const [security, setSecurity] = useState({
        twoFactor: true,
        tempAccess: false
    });

    return (
        <div className="min-h-screen bg-slate-50/50">
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
                    title="Settings"
                    subtitle="Manage your account preferences and system configuration"
                />

                <main className="p-6 lg:p-8 max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Settings Navigation */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sticky top-24">
                                <nav className="space-y-1">
                                    <SettingsTab
                                        id="profile"
                                        label="My Profile"
                                        icon={<User className="w-4 h-4" />}
                                        activeTab={activeTab}
                                        onClick={setActiveTab}
                                    />
                                    <SettingsTab
                                        id="notifications"
                                        label="Notifications"
                                        icon={<Bell className="w-4 h-4" />}
                                        activeTab={activeTab}
                                        onClick={setActiveTab}
                                    />
                                    <SettingsTab
                                        id="preferences"
                                        label="Preferences"
                                        icon={<Settings className="w-4 h-4" />}
                                        activeTab={activeTab}
                                        onClick={setActiveTab}
                                    />
                                    <SettingsTab
                                        id="security"
                                        label="Security"
                                        icon={<Shield className="w-4 h-4" />}
                                        activeTab={activeTab}
                                        onClick={setActiveTab}
                                    />
                                </nav>
                            </div>
                        </aside>

                        {/* Settings Content */}
                        <div className="flex-1 space-y-6">
                            {/* Profile Section */}
                            {activeTab === "profile" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Profile Header Card */}
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-bold border-4 border-white shadow-lg">
                                                    D
                                                </div>
                                                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                                                    <User className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h2 className="text-2xl font-bold text-slate-900">Dr. Harshal</h2>
                                                <p className="text-slate-500">Senior Radiologist</p>
                                                <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                                        <Shield className="w-3 h-3" />
                                                        Administrator
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                                        <Check className="w-3 h-3" />
                                                        Verified
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Info Form */}
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                                            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Edit Details</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        defaultValue="Dr. Harshal"
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        defaultValue="dr.harshal@shealth.ai"
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Department</label>
                                                <select className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none bg-white">
                                                    <option>Radiology</option>
                                                    <option>Neurology</option>
                                                    <option>Cardiology</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Phone</label>
                                                <input
                                                    type="tel"
                                                    defaultValue="+1 (555) 000-0000"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Section */}
                            {activeTab === "notifications" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                        <h3 className="text-lg font-bold text-slate-900 mb-6">Email Notifications</h3>
                                        <div className="space-y-6">
                                            <Toggle
                                                label="AI Analysis Completion"
                                                description="Receive an email when automated analysis is finished."
                                                checked={notifications.email}
                                                onChange={(c) => setNotifications({ ...notifications, email: c })}
                                            />
                                            <Toggle
                                                label="Weekly Activity Digest"
                                                description="Get a summary of your weekly scans and reports."
                                                checked={notifications.weeklyDigest}
                                                onChange={(c) => setNotifications({ ...notifications, weeklyDigest: c })}
                                            />
                                            <Toggle
                                                label="System Updates"
                                                description="News about Shealth AI features and improvements."
                                                checked={notifications.updates}
                                                onChange={(c) => setNotifications({ ...notifications, updates: c })}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                        <h3 className="text-lg font-bold text-slate-900 mb-6">Push Notifications</h3>
                                        <div className="space-y-6">
                                            <Toggle
                                                label="Real-time Alerts"
                                                description="Get notified immediately for critical findings."
                                                checked={notifications.push}
                                                onChange={(c) => setNotifications({ ...notifications, push: c })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preferences Section */}
                            {activeTab === "preferences" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                        <h3 className="text-lg font-bold text-slate-900 mb-6">Appearance</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <ThemeOption icon={<Sun className="w-6 h-6" />} label="Light" active={true} />
                                            <ThemeOption icon={<Moon className="w-6 h-6" />} label="Dark" active={false} />
                                            <ThemeOption icon={<Monitor className="w-6 h-6" />} label="System" active={false} />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                        <h3 className="text-lg font-bold text-slate-900 mb-6">Regional</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Language</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none bg-white">
                                                        <option>English (US)</option>
                                                        <option>Spanish</option>
                                                        <option>French</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Timezone</label>
                                                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none bg-white">
                                                    <option>UTC-05:00 (Eastern Time)</option>
                                                    <option>UTC-08:00 (Pacific Time)</option>
                                                    <option>UTC+00:00 (London)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Section */}
                            {activeTab === "security" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-slate-900">Sign In Method</h3>
                                            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded">Last changed 3 months ago</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 text-sm">Email Address</p>
                                                        <p className="text-xs text-slate-500">dr.harshal@shealth.ai</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm font-medium text-slate-600 hover:text-slate-900">Update</button>
                                            </div>
                                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                                        <Lock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 text-sm">Password</p>
                                                        <p className="text-xs text-slate-500">••••••••••••</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm font-medium text-slate-600 hover:text-slate-900">Reset</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                        <h3 className="text-lg font-bold text-slate-900 mb-6">Advanced Security</h3>
                                        <div className="space-y-6">
                                            <Toggle
                                                label="Two-Factor Authentication"
                                                description="Add an extra layer of security to your account."
                                                checked={security.twoFactor}
                                                onChange={(c) => setSecurity({ ...security, twoFactor: c })}
                                            />
                                            <Toggle
                                                label="Temporary Support Access"
                                                description="Allow Shealth AI support to access your account for 2 hours."
                                                checked={security.tempAccess}
                                                onChange={(c) => setSecurity({ ...security, tempAccess: c })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm">
                                    Cancel
                                </button>
                                <button className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 text-sm">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// Sub-components for cleaner code
function SettingsTab({ id, label, icon, activeTab, onClick }: any) {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive
                    ? "bg-slate-900 text-white shadow-md transform scale-[1.02]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
            `}
        >
            {icon}
            {label}
            {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />}
        </button>
    );
}

interface ToggleProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`
                    w-12 h-6 rounded-full transition-colors flex items-center p-1
                    ${checked ? "bg-[var(--color-primary)]" : "bg-slate-200"}
                `}
            >
                <div
                    className={`
                        w-4 h-4 rounded-full bg-white shadow-sm transition-transform
                        ${checked ? "translate-x-6" : "translate-x-0"}
                    `}
                />
            </button>
        </div>
    );
}

function ThemeOption({ icon, label, active }: any) {
    return (
        <button className={`
            flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all
            ${active
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-100 hover:border-slate-200 bg-white"
            }
        `}>
            <div className={`p-2 rounded-xl ${active ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                {icon}
            </div>
            <span className={`text-sm font-medium ${active ? "text-blue-700" : "text-slate-600"}`}>
                {label}
            </span>
        </button>
    );
}
