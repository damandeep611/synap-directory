"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  LogOut,
  Loader2,
  ArrowRight,
  Search,
  X,
  Link as LinkIcon,
  FileText,
  ChevronDown,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useSession, signOut } from "@/utils/auth-client";
import {
  fetchUrlMetadata,
  saveBookmark,
  getCategories,
  getAllBookmarks,
  deleteBookmark,
} from "@/actions/bookmarks";
import { createMarkdownPost } from "@/actions/markdown-posts";
import toast from "react-hot-toast";
import { CATEGORY_SIDEBAR_ITEMS } from "@/utils/sidebar-constants";

interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: string;
  createdAt: Date;
  sidebarOption: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);

  // Workflow State
  const [resourceType, setResourceType] = useState<"link" | "markdown">("link");
  const [step, setStep] = useState<"input" | "preview">("input");
  const [isLoading, setIsLoading] = useState(false);

  // Link Data State
  const [url, setUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSidebarOption, setSelectedSidebarOption] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });

  // Markdown Data State
  const [mdFormData, setMdFormData] = useState({
    title: "",
    description: "",
    content: "",
    sidebarOption: "",
  });

  // Resources List State
  const [resources, setResources] = useState<ResourceItem[]>([]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin");
    }
  }, [session, isPending, router]);

  const loadResources = async () => {
    const res = await getAllBookmarks();
    if (res.success && res.data) {
      setResources(res.data);
    }
  };

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
    loadResources();
    // Set default sidebar option
    if (CATEGORY_SIDEBAR_ITEMS.length > 0) {
      setSelectedSidebarOption(CATEGORY_SIDEBAR_ITEMS[0].id);
      setMdFormData((prev) => ({
        ...prev,
        sidebarOption: CATEGORY_SIDEBAR_ITEMS[0].id,
      }));
    }
  }, []);

  // Auto-select sidebar option based on resource type
  useEffect(() => {
    const category = categories.find((c) => c.id === selectedCategory);
    if (category && category.slug === "articles") {
      setSelectedSidebarOption("articles");
    }
  }, [selectedCategory, categories]);

  const handleLogout = async () => {
    await signOut();
    router.push("/admin");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;

    // Optimistic update
    setResources((prev) => prev.filter((r) => r.id !== id));
    toast.loading("Deleting...", { id: "delete-toast" });

    try {
      const result = await deleteBookmark(id);
      if (result.success) {
        toast.success("Resource deleted", { id: "delete-toast" });
        loadResources(); // Refresh to be sure
      } else {
        toast.error(`Error: ${result.error}`, { id: "delete-toast" });
        loadResources(); // Revert on error
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete", { id: "delete-toast" });
      loadResources();
    }
  };

  // --- Link Workflow ---

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
        sidebarOption: selectedSidebarOption,
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
        loadResources();
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

  // --- Markdown Workflow ---

  const handleMarkdownSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mdFormData.title || !mdFormData.description || !mdFormData.content) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append("title", mdFormData.title);
    data.append("description", mdFormData.description);
    data.append("content", mdFormData.content);
    data.append("sidebarOption", mdFormData.sidebarOption);

    try {
      const result = await createMarkdownPost(data);
      if (result.success) {
        toast.success("Markdown post published!");
        setMdFormData({
          title: "",
          description: "",
          content: "",
          sidebarOption: mdFormData.sidebarOption,
        });
        loadResources();
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create post"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
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
            <h1 className="text-5xl md:text-6xl font-serif italic mb-2 tracking-tight">
              System Administration
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 text-xs font-medium tracking-wider uppercase"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-16">
          {/* Main Form Section */}
          <div className="w-full">
            <div className="p-1 rounded-3xl bg-linear-to-b from-white/10 to-transparent">
              <div className="bg-[#0A0A0A] rounded-[22px] p-8 border border-white/5 h-full relative overflow-hidden group">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-serif italic flex items-center gap-3">
                      <Plus className="w-5 h-5 text-yellow-200" />
                      Add New Resource
                    </h2>

                    {/* Mode Toggle */}
                    <div className="bg-white/5 p-1 rounded-lg flex items-center">
                      <button
                        onClick={() => setResourceType("link")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                          resourceType === "link"
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        Link
                      </button>
                      <button
                        onClick={() => setResourceType("markdown")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                          resourceType === "markdown"
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        Markdown
                      </button>
                    </div>
                  </div>

                  {resourceType === "link" ? (
                    /* --- LINK MODE --- */
                    step === "input" ? (
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
                          {/* Category/Type Select */}
                          <div className="space-y-2">
                            <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                              Resource Type
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
                                  categories
                                    .filter((c) => c.slug !== "md")
                                    .map((cat) => (
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
                                <ChevronDown size={16} />
                              </div>
                            </div>
                          </div>

                          {/* Sidebar Section Select */}
                          <div className="space-y-2">
                            <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                              Sidebar Section
                            </label>
                            <div className="relative">
                              <select
                                value={selectedSidebarOption}
                                onChange={(e) =>
                                  setSelectedSidebarOption(e.target.value)
                                }
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all appearance-none text-white"
                              >
                                {CATEGORY_SIDEBAR_ITEMS.map((item) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                    className="bg-black"
                                  >
                                    {item.label}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown size={16} />
                              </div>
                            </div>
                          </div>
                        </div>

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
                    )
                  ) : (
                    /* --- MARKDOWN MODE --- */
                    <form className="space-y-6" onSubmit={handleMarkdownSave}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                            Post Title
                          </label>
                          <input
                            type="text"
                            value={mdFormData.title}
                            onChange={(e) =>
                              setMdFormData({
                                ...mdFormData,
                                title: e.target.value,
                              })
                            }
                            placeholder="e.g. The Future of AI"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/20"
                          />
                        </div>

                        {/* Sidebar Section Select for MD */}
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                            Sidebar Section
                          </label>
                          <div className="relative">
                            <select
                              value={mdFormData.sidebarOption}
                              onChange={(e) =>
                                setMdFormData({
                                  ...mdFormData,
                                  sidebarOption: e.target.value,
                                })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all appearance-none text-white"
                            >
                              {CATEGORY_SIDEBAR_ITEMS.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                  className="bg-black"
                                >
                                  {item.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ">
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={mdFormData.description}
                          onChange={(e) =>
                            setMdFormData({
                              ...mdFormData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Brief summary..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                          Content (Markdown)
                        </label>
                        <textarea
                          value={mdFormData.content}
                          onChange={(e) =>
                            setMdFormData({
                              ...mdFormData,
                              content: e.target.value,
                            })
                          }
                          rows={10}
                          placeholder="# Hello World..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/20 font-mono"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          disabled={isLoading}
                          className="w-full bg-white text-black font-medium tracking-widest text-xs py-4 rounded-xl hover:bg-gray-200 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-4 h-4" />
                              Publish Post
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

          {/* Library Section - Modern Table View */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif italic flex items-center gap-3">
                  <Search className="w-5 h-5 text-yellow-200" />
                  Library Registry
                </h2>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">
                  Managing {resources.length} active resources
                </p>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">
                        Resource Details
                      </th>
                      <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">
                        Section
                      </th>
                      <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">
                        Date Added
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-medium text-white/40 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {resources.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-16 text-center text-white/30 text-sm italic"
                        >
                          No resources found in the registry.
                        </td>
                      </tr>
                    ) : (
                      resources.map((item) => (
                        <tr
                          key={item.id}
                          className="group hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white group-hover:text-yellow-100 transition-colors truncate max-w-md">
                                {item.title}
                              </span>
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-1.5 mt-0.5 transition-colors"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  <span className="truncate max-w-xs">
                                    {item.url}
                                  </span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] uppercase tracking-wider text-yellow-200/80 bg-yellow-900/20 px-2 py-1 rounded-md border border-yellow-200/10 whitespace-nowrap">
                              {item.sidebarOption || "General"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-white/40 tabular-nums">
                              {new Date(item.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                  title="Open Link"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Delete Resource"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}