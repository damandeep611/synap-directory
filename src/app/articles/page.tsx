"use client";

import PageHeader from "@/components/PageHeader";

export default function ArticlesPage() {
  return (
    <div className="min-h-full bg-black text-white">
      <PageHeader 
        title="Articles" 
        subtitle="In-depth analysis, tutorials, and insights into the world of synthetic intelligence."
        category="Library"
      />
      
      <div className="px-8 md:px-12 py-12">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-full h-32 bg-black/50 rounded-lg mb-4 overflow-hidden">
                    <div className="w-full h-full bg-white/5 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-[9px] uppercase tracking-wider text-yellow-200/60">Analysis</span>
                     <span className="text-[9px] text-white/20">•</span>
                     <span className="text-[9px] text-white/20">Dec 18, 2025</span>
                  </div>
                  <h3 className="text-base font-medium mb-1.5 group-hover:text-yellow-200 transition-colors">The Future of Generative Models</h3>
                  <p className="text-xs text-white/40 leading-relaxed line-clamp-2">Exploring the implications of next-generation transformers in production environments.</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
