"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Fingerprint, ChevronRight, Loader2 } from "lucide-react";
import { signIn, useSession } from "@/utils/auth-client";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isPending && session) {
      router.push("/admin/dashboard");
    }
  }, [session, isPending, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Authentication failed");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push("/admin/dashboard");
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-200 animate-spin" />
      </div>
    );
  }

  // Don't show login form if already logged in (will redirect)
  if (session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-200 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-2rem)] flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card Container */}
        <div className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Header */}
          <div className="mb-10 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-6"
            >
              <ShieldCheck className="w-5 h-5 text-white/70" />
            </motion.div>
            <h1 className="text-4xl font-serif italic text-white mb-2 tracking-tight">
              System Access
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Restricted Environment
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div className="space-y-4">
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-yellow-200/70 transition-colors">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-sm focus:outline-none focus:border-yellow-200/30 focus:bg-white/5 transition-all duration-300 placeholder:text-white/20"
                  placeholder="Identity String"
                  required
                />
              </div>

              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-yellow-200/70 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-sm focus:outline-none focus:border-yellow-200/30 focus:bg-white/5 transition-all duration-300 placeholder:text-white/20"
                  placeholder="Passphrase"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-medium py-4 rounded-xl mt-6 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
            >
              <span className="relative z-10">
                {isLoading ? "Authenticating..." : "Initialize Session"}
              </span>
              {!isLoading && (
                <ChevronRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
              )}
              <div className="absolute inset-0 bg-yellow-200 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          {/* Footer Status */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 uppercase tracking-wider">
            <span>Synap Security</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
              Gateway Active
            </span>
          </div>
        </div>

        <div className="text-center mt-6 text-[10px] text-white/20">
          <p>Unauthorized access attempts will be logged.</p>
        </div>
      </motion.div>
    </div>
  );
}