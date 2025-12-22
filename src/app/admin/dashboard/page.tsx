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
  FolderTree,
  Layers,
  LayoutGrid
} from "lucide-react";
import { useSession, signOut } from "@/utils/auth-client";
import {
  fetchUrlMetadata,
  saveBookmark,
  getAllBookmarks,
  deleteBookmark,
  getTags,
  createTag,
} from "@/actions/bookmarks";
import {
    getSidebarData,
    createSidebarSection,
    createCategory,
    deleteSidebarSection,
    deleteCategory,
    getResourceTypes
} from "@/actions/sidebar";
import { createMarkdownPost } from "@/actions/markdown-posts";
import toast from "react-hot-toast";
import TagManager from "@/components/TagManager";

interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: string;
  createdAt: Date;
  categoryName: string;
  resourceType: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    sectionId: string | null;
    iconUrl?: string | null;
}

interface SidebarSection {
    id: string;
    title: string;
    slug: string;
    sortOrder: number;
    categories: Category[];
}

interface ResourceType {
    id: string;
    name: string;
    slug: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  // Data State
  const [sections, setSections] = useState<SidebarSection[]>([]);
  const [resourceTypesList, setResourceTypesList] = useState<ResourceType[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);

  // View State
  const [activeTab, setActiveTab] = useState<"structure" | "resources">("structure");

  // Workflow State (Resources)
  const [selectedResourceTypeSlug, setSelectedResourceTypeSlug] = useState<string>("link"); // 'link' | 'post' | ...
  const [step, setStep] = useState<"input" | "preview">("input");
  const [isLoading, setIsLoading] = useState(false);

  // Forms State
  const [url, setUrl] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  
  const [resourceFormData, setResourceFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    content: "", // For markdown
  });

  // Structure Management State
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIconUrl, setNewCategoryIconUrl] = useState("");
  const [targetSectionId, setTargetSectionId] = useState("");

  // Tag State
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin");
    }
  }, [session, isPending, router]);

  const loadData = async () => {
    const [sidebarRes, typesRes, itemsRes] = await Promise.all([
        getSidebarData(),
        getResourceTypes(),
        getAllBookmarks()
    ]);

    if (sidebarRes.success && sidebarRes.data) setSections(sidebarRes.data);
    if (typesRes.success && typesRes.data) setResourceTypesList(typesRes.data);
    if (itemsRes.success && itemsRes.data) setResources(itemsRes.data as ResourceItem[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Set default target section
  useEffect(() => {
      if (sections.length > 0 && !targetSectionId) {
          setTargetSectionId(sections[0].id);
      }
  }, [sections, targetSectionId]);

  // Fetch tags when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const loadTags = async () => {
        const res = await getTags(selectedCategoryId);
        if (res.success && res.data) {
          setAvailableTags(res.data);
          setSelectedTagIds([]); 
        }
      };
      loadTags();
    }
  }, [selectedCategoryId]);

  const handleLogout = async () => {
    await signOut();
    router.push("/admin");
  };

  // --- Structure Actions ---

  const handleCreateSection = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSectionTitle) return;
      toast.loading("Creating section...", { id: "struct" });
      const res = await createSidebarSection({ title: newSectionTitle, sortOrder: sections.length + 1 });
      if (res.success) {
          toast.success("Section created!", { id: "struct" });
          setNewSectionTitle("");
          loadData();
      } else {
          toast.error("Failed to create section", { id: "struct" });
      }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !targetSectionId) return;
    toast.loading("Creating category...", { id: "struct" });
    const res = await createCategory({ 
        name: newCategoryName, 
        sectionId: targetSectionId,
        iconUrl: newCategoryIconUrl || undefined
    });
    if (res.success) {
        toast.success("Category created!", { id: "struct" });
        setNewCategoryName("");
        setNewCategoryIconUrl("");
        loadData();
    } else {
        toast.error("Failed to create category", { id: "struct" });
    }
  };

  const handleDeleteSection = async (id: string) => {
      if(!confirm("Delete this section and all its categories?")) return;
      await deleteSidebarSection(id);
      loadData();
  };

  const handleDeleteCategory = async (id: string) => {
      if(!confirm("Delete this category?")) return;
      await deleteCategory(id);
      loadData();
  };

  // --- Resource Actions ---

  const handleCreateTag = async (tagName: string) => {
    if (!selectedCategoryId) return;

    try {
      const res = await createTag({ 
        name: tagName, 
        categoryId: selectedCategoryId,
      });
      if (res.success && res.data) {
        setAvailableTags((prev) => [...prev, res.data as Tag]);
        setSelectedTagIds((prev) => [...prev, (res.data as Tag).id]);
        toast.success("Tag created!");
      } else {
        toast.error(res.error || "Failed to create tag");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating tag");
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const result = await fetchUrlMetadata({ url });
      if (result.success && result.data) {
        setResourceFormData({
          ...resourceFormData,
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

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
        toast.error("Please select a category");
        return;
    }

    setIsLoading(true);
    
    // Find the actual resource type ID
    const typeObj = resourceTypesList.find(t => t.slug === selectedResourceTypeSlug) 
                 || resourceTypesList.find(t => t.slug === 'link'); // Fallback

    if (!typeObj) {
        toast.error("Invalid resource type configuration");
        setIsLoading(false);
        return;
    }

    try {
      if (selectedResourceTypeSlug === 'post' || selectedResourceTypeSlug === 'markdown') {
           // Markdown Flow
           const data = new FormData();
           data.append("title", resourceFormData.title);
           data.append("description", resourceFormData.description);
           data.append("content", resourceFormData.content);
           data.append("categoryId", selectedCategoryId);
           
           const result = await createMarkdownPost(data);
           if (result.success) {
               toast.success("Post published!");
               resetForm();
               loadData();
           } else {
               toast.error(result.error as string);
           }

      } else {
          // Link/Tool Flow
          const result = await saveBookmark({
            url,
            resourceTypeId: typeObj.id,
            categoryId: selectedCategoryId,
            title: resourceFormData.title,
            description: resourceFormData.description,
            imageUrl: resourceFormData.imageUrl,
            tagIds: selectedTagIds,
          });

          if (result.success) {
            toast.success("Resource added!");
            resetForm();
            loadData();
          } else {
            toast.error(`Error: ${result.error}`);
          }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
      if (!confirm("Delete resource?")) return;
      await deleteBookmark(id);
      loadData();
  };

  const resetForm = () => {
      setUrl("");
      setStep("input");
      setResourceFormData({ title: "", description: "", imageUrl: "", content: "" });
      setSelectedTagIds([]);
  };

  if (isPending || !session) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif italic mb-2 tracking-tight">
              System Administration
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white/5 p-1 rounded-lg flex items-center">
                <button
                    onClick={() => setActiveTab("structure")}
                    className={`px-4 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                        activeTab === "structure" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                    }`}
                >
                    <FolderTree className="w-3 h-3" /> Structure
                </button>
                <button
                    onClick={() => setActiveTab("resources")}
                    className={`px-4 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                        activeTab === "resources" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                    }`}
                >
                    <LayoutGrid className="w-3 h-3" /> Resources
                </button>
             </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 text-xs font-medium tracking-wider uppercase"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* --- STRUCTURE TAB --- */}
        {activeTab === "structure" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section Manager */}
                <div className="lg:col-span-1 space-y-8">
                     <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-serif italic mb-6 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-yellow-200" /> Sidebar Sections
                        </h2>
                        <form onSubmit={handleCreateSection} className="space-y-4 mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">New Section Title</label>
                                <input 
                                    value={newSectionTitle}
                                    onChange={(e) => setNewSectionTitle(e.target.value)}
                                    placeholder="e.g. Directory"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/20"
                                />
                            </div>
                            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg font-medium transition-colors">
                                Create Section
                            </button>
                        </form>

                        <div className="space-y-2">
                            {sections.map(section => (
                                <div key={section.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg group">
                                    <span className="text-sm font-medium">{section.title}</span>
                                    <button onClick={() => handleDeleteSection(section.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>

                {/* Category Manager */}
                <div className="lg:col-span-2 space-y-8">
                     <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-white/5 h-full">
                        <h2 className="text-xl font-serif italic mb-6 flex items-center gap-2">
                            <FolderTree className="w-4 h-4 text-yellow-200" /> Category Hierarchy
                        </h2>

                        <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                             <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">Parent Section</label>
                                <div className="relative">
                                    <select 
                                        value={targetSectionId}
                                        onChange={(e) => setTargetSectionId(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/20 appearance-none text-white"
                                    >
                                        {sections.map(s => <option key={s.id} value={s.id} className="bg-[#0A0A0A] text-white">{s.title}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">Category Name</label>
                                <input 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Web3 Tools"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/20"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">Category Icon URL</label>
                                <input 
                                    value={newCategoryIconUrl}
                                    onChange={(e) => setNewCategoryIconUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/20"
                                />
                             </div>
                             <div className="md:col-span-2">
                                <button className="w-full bg-white text-black text-xs py-3 rounded-lg font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">
                                    Add Category to {sections.find(s => s.id === targetSectionId)?.title || "Section"}
                                </button>
                             </div>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sections.map(section => (
                                <div key={section.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                                        {section.title}
                                    </h3>
                                    {section.categories.length === 0 ? (
                                        <p className="text-white/20 text-xs italic">No categories yet.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {section.categories.map(cat => (
                                                <li key={cat.id} className="flex items-center justify-between text-sm text-white/80 p-2 hover:bg-white/5 rounded-md group">
                                                    <span>{cat.name}</span>
                                                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            </div>
        )}

        {/* --- RESOURCES TAB --- */}
        {activeTab === "resources" && (
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
                           onClick={() => { setSelectedResourceTypeSlug("link"); setStep("input"); }}
                           className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                             selectedResourceTypeSlug === "link"
                               ? "bg-white/10 text-white shadow-sm"
                               : "text-white/40 hover:text-white"
                           }`}
                         >
                           <LinkIcon className="w-3 h-3" />
                           Link
                         </button>
                         <button
                           onClick={() => { setSelectedResourceTypeSlug("post"); setStep("input"); }}
                           className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                             selectedResourceTypeSlug === "post" || selectedResourceTypeSlug === "markdown"
                               ? "bg-white/10 text-white shadow-sm"
                               : "text-white/40 hover:text-white"
                           }`}
                         >
                           <FileText className="w-3 h-3" />
                           Post
                         </button>
                       </div>
                     </div>
   
                     {selectedResourceTypeSlug !== "post" && selectedResourceTypeSlug !== "markdown" ? (
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
                               placeholder="https://..."
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
                                   Analyzing...
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
                         <form className="space-y-8" onSubmit={handleSaveResource}>
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
   
                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                             {/* Left Column: Form Details */}
                             <div className="lg:col-span-2 space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Category Select Grouped by Section */}
                                 <div className="space-y-2 md:col-span-2">
                                   <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                                     Category
                                   </label>
                                   <div className="relative">
                                     <select
                                       value={selectedCategoryId}
                                       onChange={(e) =>
                                         setSelectedCategoryId(e.target.value)
                                       }
                                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all appearance-none text-white"
                                     >
                                         <option value="" disabled className="bg-[#0A0A0A] text-white">Select Category</option>
                                         {sections.map(section => (
                                             <optgroup key={section.id} label={section.title} className="bg-[#0A0A0A] text-white/50">
                                                 {section.categories.map(cat => (
                                                     <option key={cat.id} value={cat.id} className="bg-[#0A0A0A] text-white">
                                                         {cat.name}
                                                     </option>
                                                 ))}
                                             </optgroup>
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
                                   value={resourceFormData.title}
                                   onChange={(e) =>
                                     setResourceFormData({
                                       ...resourceFormData,
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
                                   value={resourceFormData.description}
                                   onChange={(e) =>
                                     setResourceFormData({
                                       ...resourceFormData,
                                       description: e.target.value,
                                     })
                                   }
                                   rows={3}
                                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                                 />
                               </div>
   
                               {resourceFormData.imageUrl && (
                                 <div className="space-y-2">
                                   <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                                     Image Preview
                                   </label>
                                   <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                     <img
                                       src={resourceFormData.imageUrl}
                                       alt="Preview"
                                       className="w-full h-full object-cover opacity-80"
                                     />
                                     <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                                   </div>
                                 </div>
                               )}
                             </div>
   
                             {/* Right Column: Tag Management */}
                             <div className="space-y-6">
                               <TagManager
                                 availableTags={availableTags}
                                 selectedTagIds={selectedTagIds}
                                 onToggleTag={toggleTag}
                                 onCreateTag={handleCreateTag}
                               />
                             </div>
                           </div>
   
                           <div className="pt-4">
                             <button
                               disabled={isLoading}
                               className="w-full bg-white text-black font-medium tracking-widest text-xs py-4 rounded-xl hover:bg-gray-200 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                             >
                               {isLoading ? (
                                 <>
                                   <Loader2 className="w-4 h-4 animate-spin" />
                                   Saving...
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
                       <form className="space-y-6" onSubmit={handleSaveResource}>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                               Post Title
                             </label>
                             <input
                               type="text"
                               value={resourceFormData.title}
                               onChange={(e) =>
                                 setResourceFormData({
                                   ...resourceFormData,
                                   title: e.target.value,
                                 })
                               }
                               placeholder="e.g. The Future of AI"
                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/20"
                             />
                           </div>
   
                           {/* Category Select for MD */}
                           <div className="space-y-2">
                             <label className="text-xs text-white/40 font-medium tracking-wider uppercase pl-1">
                               Category
                             </label>
                             <div className="relative">
                               <select
                                 value={selectedCategoryId}
                                 onChange={(e) =>
                                   setSelectedCategoryId(e.target.value)
                                 }
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all appearance-none text-white"
                               >
                                 <option value="" disabled>Select Category</option>
                                  {sections.map(section => (
                                      <optgroup key={section.id} label={section.title}>
                                          {section.categories.map(cat => (
                                              <option key={cat.id} value={cat.id}>
                                                  {cat.name}
                                              </option>
                                          ))}
                                      </optgroup>
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
                             value={resourceFormData.description}
                             onChange={(e) =>
                               setResourceFormData({
                                 ...resourceFormData,
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
                             value={resourceFormData.content}
                             onChange={(e) =>
                               setResourceFormData({
                                 ...resourceFormData,
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
   
             {/* Library Section */}
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
                           Category
                         </th>
                         <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">
                            Type
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
                             colSpan={5}
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
                                 {item.categoryName}
                               </span>
                             </td>
                             <td className="px-6 py-4">
                               <span className="text-[10px] uppercase tracking-wider text-white/60 px-2 py-1 rounded-md border border-white/10 whitespace-nowrap">
                                 {item.resourceType}
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
                                   onClick={() => handleDeleteResource(item.id)}
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
        )}
      </motion.div>
    </div>
  );
}
