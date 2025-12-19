"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    LogOut,
    Settings,
    FileText,
    Loader2,
} from "lucide-react";
import { useSession, signOut } from "@/utils/auth-client";

export default function AdminDashboard() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/admin");
        }
    }, [session, isPending, router]);

    const handleLogout = async () => {
        await signOut();
        router.push("/admin");
    };

    if (isPending) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-yellow-200 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-200/10 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-yellow-200" />
                        </div>
                        <div>
                            <h1 className="text-lg font-medium">Admin Dashboard</h1>
                            <p className="text-xs text-white/40">
                                Welcome, {session.user.name || session.user.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            { label: "Total Tools", value: "0", icon: Settings },
                            { label: "Total Articles", value: "0", icon: FileText },
                            { label: "Categories", value: "10", icon: ShieldCheck },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <stat.icon className="w-5 h-5 text-white/40" />
                                </div>
                                <p className="text-3xl font-light mb-1">{stat.value}</p>
                                <p className="text-xs text-white/40 uppercase tracking-wider">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Content Management Section */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                        <h2 className="text-xl font-medium mb-6">Content Management</h2>
                        <p className="text-white/40 text-sm">
                            Content management features will be added here. You can manage
                            tools, articles, and other directory content from this dashboard.
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
