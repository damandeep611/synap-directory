import React, { Suspense } from 'react';
import MarkdownCard from "@/components/MarkdownCard";
import PromptSearch from "@/components/PromptSearch";
import { getPromptsData } from "@/actions/sidebar";
import { Terminal, Command } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PromptsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const { success, data } = await getPromptsData(q);
  const prompts = success && data ? data : [];

  return (
    <div className="min-h-full bg-[#050505] text-white">
      {/* Search-Centric Header */}
      <div className="relative pt-12 pb-8 px-6 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            <Command className="w-3 h-3" />
            System Core / Prompt Base
          </div>

          <p className="text-center text-white/40 text-xs md:text-sm font-light leading-relaxed max-w-2xl">
            The neural hub for prompt engineers where you can explore optimized system rules, browse cognitive frameworks, share directives, and discover the future of synthetic intelligence all in one place.
          </p>

          <div className="w-full">
            <Suspense fallback={<div className="h-16 w-full bg-white/5 animate-pulse rounded-2xl" />}>
              <PromptSearch />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        {prompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((post) => (
                <MarkdownCard key={post.id} post={post} />
              ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                <Terminal className="w-12 h-12 mb-4 opacity-10" />
                <p className="font-mono text-xs uppercase tracking-widest">
                  {q ? `No matches found for "${q}"` : "Neural base empty."}
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
