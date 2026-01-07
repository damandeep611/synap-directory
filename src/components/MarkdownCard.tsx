"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface MarkdownCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    content: string;
    createdAt: Date | null;
  };
}

export default function MarkdownCard({ post }: MarkdownCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    toast.success("Prompt copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col h-[350px] bg-[#080808] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:bg-[#0A0A0A] shadow-2xl">
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-lg font-bold tracking-tight text-white leading-tight max-w-[85%] group-hover:text-blue-200 transition-colors">
            {post.title}
          </h3>
          <div className="flex flex-col gap-2 items-end">
            <span className="px-1.5 py-0.5 rounded border border-white/10 text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] bg-white/[0.02]">
              MD
            </span>
          </div>
        </div>

        <p className="text-[11px] text-white/30 font-light mb-4 tracking-wide line-clamp-1">
          {post.description}
        </p>

        <div className="h-px w-full bg-white/5 mb-4" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
          <div className="text-white/50 font-sans text-[12px] leading-relaxed whitespace-pre-wrap pb-6">
            {post.content}
          </div>
        </div>
        
        {/* Actions - Positioned absolutely for a cleaner bottom */}
        <div className="absolute bottom-4 right-4 z-20">
          <button 
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/20 hover:text-blue-400 transition-all border border-white/5 hover:border-blue-500/30 backdrop-blur-md group/copy"
            title="Copy prompt"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 group-hover/copy:scale-110 transition-transform" />}
          </button>
        </div>

        {/* Subtle Gradient at Bottom of Scroll Area */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}
