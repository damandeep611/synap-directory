"use client"

import React from 'react';
import { motion } from 'framer-motion';

interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  return (
    <div className="flex-1 h-full overflow-y-auto no-scrollbar pb-32 ">
      {/* Cinematic Hero Cover - 45vh approx */}
      <section className="relative w-full h-[45vh] min-h-100 overflow-hidden flex items-center px-12 md:px-20 border-b border-white/5">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60"
            alt="Explore Cover"
          /> 
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-2xl pt-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-yellow-200/50" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-yellow-200/80 font-bold">The Archive</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-serif italic text-white mb-6 leading-[0.9]">
            {activeTab === 'explore' ? 'Boundless Intelligence' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <p className="text-sm text-white/50 font-light tracking-wide leading-relaxed max-w-md">
            Journey through the curated landscape of synthetic creativity. From cutting-edge model registries to advanced operational blueprints.
          </p>
        </motion.div>
      </section>

      {/* Content Section */}
      <div className="px-12 md:px-20 py-16 space-y-24">
        <div className="p-8 border border-white/10 rounded-2xl bg-white/5">
            <h2 className="text-xl font-light tracking-wide mb-4">Active Section: {activeTab}</h2>
            <p className="text-white/40">Content for {activeTab} will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
