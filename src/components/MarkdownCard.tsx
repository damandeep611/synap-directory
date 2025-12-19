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
    <div className="group relative flex flex-col h-[480px] bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-yellow-400/20 shadow-2xl">
      <div className="p-8 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-white uppercase leading-tight max-w-[80%]">
            {post.title}
          </h3>
          <div className="flex flex-col gap-3 items-end">
            <span className="px-2 py-0.5 rounded-md border border-white/20 text-[9px] font-mono text-white/40 uppercase tracking-widest bg-white/5">
              MD
            </span>
            <button 
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 hover:border-white/10 group/copy"
              title="Copy prompt"
            >
              {copied ? <Check className="w-4 h-4 text-yellow-400" /> : <Copy className="w-4 h-4 group-hover/copy:scale-110 transition-transform" />}
            </button>
          </div>
        </div>

        <p className="text-xs md:text-sm text-white/40 font-light mb-8 tracking-wide">
          {post.description}
        </p>

        <div className="h-[1px] w-full bg-white/10 mb-8" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="text-white/60 font-sans text-sm leading-relaxed whitespace-pre-wrap pb-4">
            {post.content}
          </div>
        </div>
        
        {/* Subtle Gradient at Bottom of Scroll Area */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
