"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Mail, ArrowRight, Lock, AlertCircle } from "lucide-react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "../services/authService";
import Link from "next/link"; // Correct import for Next.js navigation
import { useLanguage } from "../context/LanguageContext";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { translations: t } = useLanguage();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.login(data.email, data.password);
            router.push("/dashboard");
        } catch (err) {
            setError(t.auth.invalidCredentials);
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={t.auth.welcomeBack}
            subtitle={t.auth.enterCredentials}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">{t.auth.email}</label>
                    <div className="relative group">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input
                            {...register("email")}
                            type="email"
                            placeholder={t.auth.emailPlaceholder}
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'} rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-semibold text-slate-700">{t.auth.password}</label>
                        <a href="#" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">{t.auth.forgot}</a>
                    </div>
                    <div className="relative group">
                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••••••"
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'} rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                        />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
                </div>

                <Button
                    type="submit"
                    className="w-full mt-2"
                    size="lg"
                    isLoading={isLoading}
                >
                    {t.auth.signIn} <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm">
                    {t.auth.noAccount} <Link href="/register" className="font-bold text-[var(--color-primary)] hover:underline">{t.auth.requestAccess}</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
