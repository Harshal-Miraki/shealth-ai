import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/Button";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <div className="relative w-40 h-10">
                            <Image
                                src="/logos.png"
                                alt="Shealth AI Logo"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
                    <a href="#" className="hover:text-slate-800 transition-colors">Features</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">Solutions</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">About</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">Contact</a>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="outline" size="sm" className="font-semibold">
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="font-semibold shadow-md shadow-[var(--color-primary)]/20">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
