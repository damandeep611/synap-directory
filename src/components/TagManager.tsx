"use client";

import React, { useState, useMemo } from "react";
import { Plus, X, Search, Loader2, Tag as TagIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagManagerProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onCreateTag: (tagName: string) => Promise<void>;
}

export default function TagManager({
  availableTags,
  selectedTagIds,
  onToggleTag,
  onCreateTag,
}: TagManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!searchQuery) return availableTags;
    return availableTags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableTags, searchQuery]);

  // Check if the exact tag exists to prevent duplicates
  const exactMatch = availableTags.find(
    (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase()
  );

  const handleCreate = async () => {
    if (!searchQuery.trim() || exactMatch) return;
    
    setIsCreating(true);
    await onCreateTag(searchQuery);
    setIsCreating(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (exactMatch) {
        if (!selectedTagIds.includes(exactMatch.id)) {
          onToggleTag(exactMatch.id);
          setSearchQuery("");
        }
      } else {
        handleCreate();
      }
    }
  };

  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  const unselectedTags = filteredTags.filter(
    (tag) => !selectedTagIds.includes(tag.id)
  );

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-xs text-white/40 font-medium tracking-wider uppercase flex items-center gap-2">
          <TagIcon className="w-3 h-3" />
          Manage Tags
        </label>
        <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-[10px]">
          {selectedTags.length} selected
        </span>
      </div>

      {/* Selected Tags Area */}
      <div className="min-h-[40px] flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {selectedTags.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-white/20 italic"
            >
              No tags selected...
            </motion.p>
          ) : (
            selectedTags.map((tag) => (
              <motion.button
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                key={tag.id}
                onClick={() => onToggleTag(tag.id)}
                className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium bg-yellow-200/10 border border-yellow-200/20 text-yellow-100 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-200 transition-all"
              >
                {tag.name}
                <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Search & Create Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-white/20 group-focus-within:text-yellow-200/50 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or create new tag..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-200/30 focus:bg-white/10 transition-all"
        />
        {searchQuery && !exactMatch && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-all flex items-center gap-2"
            >
              {isCreating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  Create &quot;{searchQuery}&quot;
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Available Tags Cloud */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-wider">
          <span>Available Tags</span>
          {searchQuery && (
            <span>Found {unselectedTags.length} matches</span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
          {unselectedTags.length === 0 ? (
            <p className="text-xs text-white/20 italic w-full text-center py-4">
              {searchQuery ? "No matching tags found." : "No other tags available."}
            </p>
          ) : (
            unselectedTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onToggleTag(tag.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
              >
                {tag.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
