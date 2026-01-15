import React, { useState, useEffect, useRef, Suspense } from "react";
import { Search, Bell, Menu, ChevronRight, User, LogOut, Settings, X, Globe } from "lucide-react";
import { authService, User as AuthUser } from "@/app/services/authService";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

interface DashboardHeaderProps {
    onMenuToggle: () => void;
    title?: string;
    subtitle?: string;
}

const MOCK_NOTIFICATIONS = [
    { id: 1, title: "Analysis Complete", message: "Patient scan analysis finished", time: "2m ago", unread: true },
    { id: 2, title: "System Update", message: "New AI model version available", time: "1h ago", unread: false },
    { id: 3, title: "New Assignment", message: "Dr. Smith assigned a new case", time: "3h ago", unread: false },
];

function DashboardHeaderContent({ onMenuToggle, title = "Dashboard", subtitle }: DashboardHeaderProps) {
    const { language, changeLanguage, translations, isLoading } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    // Refs for click outside handling
    const userMenuRef = useRef<HTMLDivElement>(null);
    const langMenuRef = useRef<HTMLDivElement>(null);
    const notifMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    // Initialize search value from URL
    useEffect(() => {
        const query = searchParams.get("search");
        if (query) {
            setSearchValue(query);
        }
    }, [searchParams]);

    // Handle click outside to close menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setShowLangMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        authService.logout();
        router.push("/login"); // Redirect to login page
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);

        // Update URL params
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set("search", value);
        } else {
            params.delete("search");
        }
        router.replace(`?${params.toString()}`);
    };

    return (
        <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100">
            <div className="h-full px-6 flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Breadcrumb / Title */}
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-0.5">
                            <Link href="/dashboard" className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Home</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-slate-700 font-medium">{title}</span>
                        </div>
                        {subtitle && (
                            <p className="text-xs text-slate-400">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Center Section - Search */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={handleSearch}
                            placeholder="Search patients, scans, reports..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        />
                        {searchValue && (
                            <button
                                onClick={() => handleSearch({ target: { value: "" } } as any)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Notifications Dropdown */}
                    <div className="relative" ref={notifMenuRef}>
                        {/* <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`
                                relative p-2.5 rounded-xl transition-all
                                ${showNotifications ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
                            `}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                        </button> */}

                        {/* {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                                    <span className="text-xs text-[var(--color-primary)] font-medium cursor-pointer">Mark all read</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {MOCK_NOTIFICATIONS.map((notif) => (
                                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                            <div className="flex gap-3">
                                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notif.unread ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                                <div>
                                                    <p className={`text-sm ${notif.unread ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 text-center border-t border-slate-100">
                                    <button className="text-xs font-medium text-slate-500 hover:text-slate-900">View All Notifications</button>
                                </div>
                            </div>
                        )} */}
                    </div>

                    {/* Language Dropdown */}
                    <div className="relative" ref={langMenuRef}>
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className={`p-2 rounded-xl transition-all ${language !== 'en' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            title="Change Language"
                        >
                            <Globe className="w-5 h-5" />
                        </button>

                        {showLangMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { changeLanguage('en'); setShowLangMenu(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${language === 'en' ? 'font-bold text-[var(--color-primary)]' : 'text-slate-600'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => { changeLanguage('es'); setShowLangMenu(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${language === 'es' ? 'font-bold text-[var(--color-primary)]' : 'text-slate-600'}`}
                                >
                                    Español {isLoading && language !== 'es' && '...'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-8 bg-slate-200" />

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className={`
                                flex items-center gap-2 px-1.5 py-1.5 rounded-full border transition-all
                                ${showUserMenu
                                    ? 'bg-white border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                }
                            `}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                {currentUser?.name ? (
                                    <span className="text-xs font-bold text-slate-600">
                                        {currentUser.name.charAt(0).toUpperCase()}
                                    </span>
                                ) : (
                                    <User className="w-4 h-4 text-slate-500" />
                                )}
                            </div>
                            <div className="hidden sm:block text-left px-2 max-w-[100px]">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                    {currentUser?.name || 'Guest'}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate capitalize">
                                    {currentUser?.role || 'Visitor'}
                                </p>
                            </div>
                            <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform duration-200 hidden sm:block ${showUserMenu ? 'rotate-90' : 'rotate-0'}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-900">{currentUser?.name}</p>
                                    <p className="text-xs text-slate-500">{currentUser?.email || 'user@shealth.ai'}</p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            router.push('/dashboard/settings');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Account Settings
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                                        <Bell className="w-4 h-4" />
                                        Notifications
                                    </button>
                                </div>
                                <div className="p-2 border-t border-slate-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export function DashboardHeader(props: DashboardHeaderProps) {
    return (
        <Suspense fallback={
            <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100" />
        }>
            <DashboardHeaderContent {...props} />
        </Suspense>
    );
}
