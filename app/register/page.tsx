"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../components/ui/Button";
import { Mail, ArrowRight, Lock, User, FileBadge, AlertCircle } from "lucide-react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "../services/authService";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full Name is required."),
    email: z.string().email("Please enter a valid email address."),
    licenseId: z.string().min(3, "Medical License ID is required for verification."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(data);
            router.push("/dashboard");
        } catch (err) {
            setError("Registration failed. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Professional Account"
            subtitle="Join the leading platform for AI-assisted medical imaging diagnostics."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Full Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input
                            {...register("fullName")}
                            placeholder="Dr. Sarah Smith"
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'} rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                        />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-xs ml-1">{errors.fullName.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="dr.smith@hospital.com"
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'} rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                </div>

                {/* License ID */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Medical License ID</label>
                    <div className="relative group">
                        <FileBadge className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input
                            {...register("licenseId")}
                            placeholder="MD-2024-XXXX"
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.licenseId ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'} rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                        />
                    </div>
                    {errors.licenseId && <p className="text-red-500 text-xs ml-1">{errors.licenseId.message}</p>}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="••••••••"
                                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'} rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Confirm</label>
                        <div className="relative group">
                            <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <input
                                {...register("confirmPassword")}
                                type="password"
                                placeholder="••••••••"
                                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'} rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs ml-1">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                    >
                        Create Account <ArrowRight className="w-5 h-5 ml-1" />
                    </Button>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm">
                    Already have an account? <Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">Sign In</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
