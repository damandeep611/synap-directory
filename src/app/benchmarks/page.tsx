"use client";

import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from "@/components/PageHeader";
import { 
  PenTool, 
  Palette, 
  Newspaper, 
  Megaphone, 
  Code2, 
  ChevronRight,
  Zap,
  Crown,
  Trophy
} from 'lucide-react';

const categories = [
  {
    id: "writing",
    title: "Syntactic Prose",
    subtitle: "Writing & Composition",
    icon: PenTool,
    tools: [
      { name: "Claude 3.5 Sonnet", rank: "Apex", useCase: "Nuanced human-like prose and creative storytelling." },
      { name: "GPT-4o", rank: "Superior", useCase: "Instruction following and structured research papers." }
    ],
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    borderHover: "group-hover:border-blue-500/30",
    iconColor: "text-blue-400"
  },
  {
    id: "art",
    title: "Visual Synthesis",
    subtitle: "Art & Generation",
    icon: Palette,
    tools: [
      { name: "Midjourney v6", rank: "Apex", useCase: "Photorealistic textures and artistic lighting." },
      { name: "Flux.1", rank: "Superior", useCase: "Unmatched prompt adherence and text rendering." }
    ],
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    borderHover: "group-hover:border-purple-500/30",
    iconColor: "text-purple-400"
  },
  {
    id: "magazine",
    title: "Editorial Logic",
    subtitle: "Magazine & Layout",
    icon: Newspaper,
    tools: [
      { name: "Gemini 1.5 Pro", rank: "Apex", useCase: "Cross-document analysis and narrative curation." },
      { name: "Perplexity", rank: "Superior", useCase: "Real-time fact checking and source citation." }
    ],
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderHover: "group-hover:border-emerald-500/30",
    iconColor: "text-emerald-400"
  },
  {
    id: "ads",
    title: "Conversion Engine",
    subtitle: "Ads & Marketing",
    icon: Megaphone,
    tools: [
      { name: "Copy.ai", rank: "Apex", useCase: "High-velocity ad copy and brand-voice scaling." },
      { name: "AdCreative", rank: "Superior", useCase: "Conversion-optimized visual layouts." }
    ],
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    borderHover: "group-hover:border-orange-500/30",
    iconColor: "text-orange-400"
  },
  {
    id: "coding",
    title: "Neural Architecture",
    subtitle: "Coding & Systems",
    icon: Code2,
    tools: [
      { name: "Cursor (Sonnet)", rank: "Apex", useCase: "Context-aware codebase refactoring." },
      { name: "GitHub Copilot", rank: "Superior", useCase: "Autocomplete efficiency and boilerplate." }
    ],
    gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    borderHover: "group-hover:border-indigo-500/30",
    iconColor: "text-indigo-400"
  }
];

export default function BenchmarksPage() {
  return (
    <div className="min-h-full bg-[#050505] text-white pb-20 selection:bg-white/20">
      <PageHeader 
        title="Capability Mapping" 
        subtitle="Editorial breakdown of AI performance across specialized domains."
        category="Benchmarks"
      />
      
      <div className="px-8 md:px-12 py-12 space-y-12">
        {categories.map((cat, idx) => (
          <motion.section 
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-6 pl-1">
               <div className={`p-2 rounded-lg bg-white/[0.03] border border-white/5 ${cat.iconColor}`}>
                  <cat.icon className="w-5 h-5" />
               </div>
               <h2 className="text-2xl font-medium tracking-tight text-white/90">{cat.title}</h2>
               <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.tools.map((tool) => (
                <div 
                  key={tool.name}
                  className={`group relative overflow-hidden p-5 rounded-2xl border border-white/10 bg-[#0A0A0A] transition-all duration-300 ${cat.borderHover} hover:shadow-2xl hover:shadow-black/50`}
                >
                  {/* Subtle Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-white transition-colors">{tool.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          {tool.rank === 'Apex' ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                              <Crown className="w-3 h-3" /> Apex
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/50">
                              <Trophy className="w-3 h-3" /> {tool.rank}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-white/50 font-light leading-relaxed group-hover:text-white/70 transition-colors">
                      {tool.useCase}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}