"use client";

import React, { useState, useMemo } from "react";
import ResourceCard from "./ResourceCard";
import ArticleCard from "./ArticleCard";
import MarkdownCard from "./MarkdownCard";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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
    <div>
      {/* Sticky Tag Filter Bar — pill-tab style */}
      {availableTags.length > 0 && (
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] -mx-6 px-6 mb-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
            {/* "All" pill */}
            <button
              onClick={() => setSelectedTagIds([])}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 shadow-sm
                ${
                  selectedTagIds.length === 0
                    ? "bg-white text-zinc-950 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-white"
                    : "bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20"
                }`}
            >
              All
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 shadow-sm
                  ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-white text-zinc-950 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-white"
                      : "bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20"
                  }`}
              >
                {tag.name}
              </button>
            ))}

            {/* Clear indicator */}
            {selectedTagIds.length > 0 && (
              <button
                onClick={() => setSelectedTagIds([])}
                className="shrink-0 ml-1 size-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title="Clear filters"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-5">
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
        <div className="p-20 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01] text-center">
          <p className="text-zinc-600 text-sm">
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
  
  // Markdown Posts (checking content presence)
  if (res.content) {
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