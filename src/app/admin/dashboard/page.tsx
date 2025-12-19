"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  RefreshCw,
  Activity,
  Database,
  Lock,
  Plus,
  LogOut,
  Loader2,
  ArrowRight,
  Search,
  X,
} from "lucide-react";
import { useSession, signOut } from "@/utils/auth-client";
import { fetchUrlMetadata, saveBookmark, getCategories } from "@/actions/bookmarks";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  // Workflow State
  const [step, setStep] = useState<"input" | "preview">("input");
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [url, setUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCategory(res.data[0].id);
        }
      }
    };
    loadCategories();
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/admin");
  };

  // Step 1: Analyze URL
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const result = await fetchUrlMetadata({ url });
      if (result.success && result.data) {
        setFormData({
          title: result.data.title,
          description: result.data.description,
          imageUrl: result.data.imageUrl || "",
        });
        setStep("preview");
        toast.success("URL analyzed successfully");
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze URL");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Save to Registry
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !selectedCategory) return;

    setIsLoading(true);
    try {
      const result = await saveBookmark({
        url,
        categoryId: selectedCategory,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
      });

      if (result.success) {
        toast.success("Resource added successfully!");
        // Reset
        setUrl("");
        setStep("input");
        setFormData({ title: "", description: "", imageUrl: "" });
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save bookmark");
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-black text-white p-8 md:p-12 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2 text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">
                Privileged Access
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif italic mb-2 tracking-tight">
              System Administration
            </h1>
            <p className="text-white/40 font-light text-lg">
              High-level registry management and node monitoring interface.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-xs font-medium tracking-wider hover:bg-white/5 transition-colors uppercase"
            >
              <RefreshCw
                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
              />
              System Sync
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 text-xs font-medium tracking-wider uppercase"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2">
            <div className="p-1 rounded-3xl bg-linear-to-b from-white/10 to-transparent">
              <div className="bg-[#0A0A0A] rounded-[22px] p-8 border border-white/5 h-full relative overflow-hidden group">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                  <h2 className="text-2xl font-serif italic mb-8 flex items-center gap-3">
                    <Plus className="w-5 h-5 text-yellow-200" />
                    Add New Resource
                  </h2>

                  {step === "input" ? (
                    /* Step 1: Input URL */
                    <form className="space-y-6" onSubmit={handleAnalyze}>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                          Source URL / Endpoint
                        </label>
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://registry.aether.lens/node/..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          disabled={isLoading || !url}
                          className="w-full bg-white text-black font-medium tracking-widest text-xs py-4 rounded-xl hover:bg-gray-200 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analyzing Node...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" />
                              Analyze Resource
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Step 2: Preview & Save */
                    <form className="space-y-6" onSubmit={handleSave}>
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                        <span className="text-sm text-white/50 truncate max-w-75">
                          {url}
                        </span>
                        <button
                          type="button"
                          onClick={() => setStep("input")}
                          className="text-xs text-red-400 hover:text-red-300 uppercase tracking-wider font-medium flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={selectedCategory}
                              onChange={(e) =>
                                setSelectedCategory(e.target.value)
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all appearance-none text-white"
                            >
                              {categories.length === 0 ? (
                                <option value="" disabled>
                                  No categories found
                                </option>
                              ) : (
                                categories.map((cat) => (
                                  <option
                                    key={cat.id}
                                    value={cat.id}
                                    className="bg-black"
                                  >
                                    {cat.name}
                                  </option>
                                ))
                              )}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1 1L5 5L9 1"
                                  stroke="white"
                                  strokeOpacity="0.4"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                        />
                      </div>

                      {formData.imageUrl && (
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                            Image Preview
                          </label>
                          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                          </div>
                        </div>
                      )}

                      <div className="pt-4">
                        <button
                          disabled={isLoading || categories.length === 0}
                          className="w-full bg-white text-black font-medium tracking-widest text-xs py-4 rounded-xl hover:bg-gray-200 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving to Registry...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-4 h-4" />
                              Push to Registry
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel - Right Column */}
          <div className="space-y-8">
            {/* Node Performance */}
            <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/10 relative overflow-hidden">
              <h3 className="text-xs font-bold text-white/40 tracking-widest uppercase mb-8">
                Node Performance
              </h3>

              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-yellow-200">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm text-white/80">Compute Usage</span>
                  </div>
                  <span className="font-mono text-sm">82%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-blue-400">
                    <Database className="w-4 h-4" />
                    <span className="text-sm text-white/80">Database Sync</span>
                  </div>
                  <span className="font-mono text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-green-400">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm text-white/80">
                      Security Status
                    </span>
                  </div>
                  <span className="font-mono text-sm">Optimal</span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="flex items-end gap-2 h-24 pt-4 border-t border-white/5">
                {[30, 45, 25, 60, 50, 80, 70, 40].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-white/10 rounded-sm hover:bg-white/20 transition-colors cursor-crosshair"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Maintenance Window (Partial from image) */}
            <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-red-900/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-red-900/5" />
              <div className="relative">
                <h3 className="text-xs font-bold text-red-400 tracking-widest uppercase mb-2">
                  Maintenance Window
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  Scheduled system optimization cycles will initiate in{" "}
                  <span className="text-white">04:22:18</span>. No downtime
                  expected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}