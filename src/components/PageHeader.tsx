"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  category?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  category = "Directory",
}) => {
  return (
    <section className="relative w-full pt-10 pb-12 px-6 md:px-8 overflow-hidden bg-[#050505] border-b border-white/5">
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Breadcrumbs - More compact */}
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide mb-4">
            <Link
              href="/"
              className="text-white/30 hover:text-white transition-colors uppercase tracking-wider"
            >
              Synap
            </Link>
            <span className="text-white/10">/</span>
            <span className="text-white/30 uppercase tracking-wider">
              {category}
            </span>
            <span className="text-white/10">/</span>
            <span className="text-white/80 uppercase tracking-wider">
              {title}
            </span>
          </div>

          {/* Title - Reduced size */}
          <h1 className="text-3xl md:text-5xl font-semibold text-white mb-3 tracking-tight leading-tight">
            {title}
          </h1>

          {/* Description - Tighter leading and max-width */}
          <p className="text-base text-white/40 leading-relaxed max-w-2xl font-light">
            {subtitle}
          </p>
        </motion.div>

        {/* Featured Card - Smaller and less intrusive */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-linear-to-tr from-white/10 via-white/5 to-transparent rounded-2xl blur-lg opacity-30" />

          <div className="relative aspect-video w-full bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-1.5 ring-1 ring-white/5 overflow-hidden">
            {/* Inner Card Content */}
            <div className="h-full w-full bg-[#0A0A0A] rounded-xl border border-white/5 relative overflow-hidden flex flex-col p-5">
              {/* Decorative Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[16px_16px]" />

              {/* Compact Content */}
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white/20 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-16 bg-white/10 rounded-full" />
                    <div className="h-1.5 w-10 bg-white/5 rounded-full" />
                  </div>
                </div>

                <div className="pt-4 mt-auto border-t border-white/5 flex justify-between items-end">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-0.5">
                      Status
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </div>
                  </div>
                  <div className="text-xl font-bold text-white/5 italic tracking-tighter">
                    SYNAP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PageHeader;