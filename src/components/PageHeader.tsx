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
    <section className="w-full pt-8 pb-16 px-8   bg-black">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[13px] font-medium mb-8">
            <Link
              href="/"
              className="text-white/40 hover:text-white transition-colors"
            >
              Synap
            </Link>
            <span className="text-white/20">→</span>
            <span className="text-white/40">{category}</span>
            <span className="text-white/20">→</span>
            <span className="text-white">{title}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-[-0.03em] leading-[0.95]">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light">
            {subtitle}
          </p>
        </motion.div>

        {/* Featured Card (Design Inspiration) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block"
        >
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-linear-to-r from-white/10 to-white/5 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden aspect-4/3 flex flex-col items-center justify-center p-8">
              <div className="w-full h-full border border-dashed border-white/5 rounded-xl flex items-center justify-center bg-black/40">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1 tracking-tighter italic">
                    synap.me
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">
                    Featured Resource
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="text-[10px] text-white/40 font-medium">
                  Your next discovery, simplified.
                </div>
                <div className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">
                  AD
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