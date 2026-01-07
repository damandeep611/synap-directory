import React from 'react';
import ExploreHeader from "@/components/ExploreHeader";
import MarkdownCard from "@/components/MarkdownCard";
import { getPromptsData } from "@/actions/sidebar";
import { Terminal } from "lucide-react";

export default async function PromptsPage() {
  const { success, data } = await getPromptsData();
  const prompts = success && data ? data : [];

  return (
    <div className="min-h-full bg-black text-white">
      <ExploreHeader
        title="Prompt Base"
        subtitle="A collection of high-utility system prompts and operational directives."
        category="Command Center"
        bgImage="/gradients/explore-bg.avif" 
      />

      <div className="px-6 md:px-12 py-12 pb-32">
        {prompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {prompts.map((post) => (
                <MarkdownCard key={post.id} post={post} />
              ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
                <Terminal className="w-12 h-12 mb-4 opacity-20" />
                <p>No prompts established yet.</p>
            </div>
        )}
      </div>
    </div>
  );
}
