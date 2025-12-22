"use client";

import React, { useState, useMemo } from "react";
import ResourceCard from "./ResourceCard";
import ArticleCard from "./ArticleCard";
import MarkdownCard from "./MarkdownCard";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X } from "lucide-react";

interface Resource {
  id: string;
  categorySlug: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  content?: string | null;
  createdAt: Date;
  tags: { id: string; name: string; slug: string }[];
}

interface ResourceFeedProps {
  resources: Resource[];
  availableTags: { id: string; name: string; slug: string }[];
}

export default function ResourceFeed({ resources, availableTags }: ResourceFeedProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const filteredResources = useMemo(() => {
    if (selectedTagIds.length === 0) return resources;
    return resources.filter((res) =>
      selectedTagIds.every((tagId) => res.tags.some((t) => t.id === tagId))
    );
  }, [resources, selectedTagIds]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="space-y-12">
      {/* Tag Filter Bar */}
      {availableTags.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-widest">
              <Filter className="w-3.5 h-3.5" />
              Filter by Tags
            </div>
            {selectedTagIds.length > 0 && (
              <button
                onClick={() => setSelectedTagIds([])}
                className="text-[10px] text-yellow-200/60 hover:text-yellow-200 flex items-center gap-1 uppercase tracking-tighter transition-colors"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-yellow-200/10 border-yellow-200/50 text-yellow-100 shadow-[0_0_20px_rgba(254,240,138,0.05)]"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredResources.map((res) => (
            <motion.div
              key={res.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {renderCard(res)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredResources.length === 0 && (
        <div className="p-20 border border-dashed border-white/10 rounded-3xl bg-white/2 text-center">
          <p className="text-white/30 italic">
            No resources match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}

function renderCard(res: Resource) {
  // Articles
  if (res.categorySlug === "articles") {
    return (
      <ArticleCard
        title={res.title}
        description={res.description}
        url={res.url}
        imageUrl={res.imageUrl}
        createdAt={res.createdAt}
      />
    );
  }
  
  // Markdown Posts (checking content or specific slug/type)
  // If we had a resourceType field we would use that. 
  // For now relying on content presence + slug heuristic if needed.
  if ((res.categorySlug === "md" || res.categorySlug === "posts") && res.content) {
    return (
      <MarkdownCard
        post={{
          id: res.id,
          title: res.title,
          description: res.description,
          content: res.content,
          createdAt: res.createdAt,
        }}
      />
    );
  }

  // Default Fallback (Tools / AI / Web3 etc)
  return (
    <ResourceCard
      title={res.title}
      description={res.description}
      url={res.url}
      imageUrl={res.imageUrl}
      date={res.createdAt}
      tags={res.tags}
    />
  );
}