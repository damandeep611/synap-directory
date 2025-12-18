"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  category?: string;
  bgImage?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, category = "The Archive", bgImage }) => {
  return (
    <section className="relative w-full h-[35vh] min-h-[280px] overflow-hidden flex items-center px-8 md:px-12 border-b border-white/5">
      <div className="absolute inset-0 z-0">
        {bgImage && (
          <Image 
            src={bgImage}
            alt={title}
            fill
            className="object-cover opacity-30"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-xl pt-12"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-[1px] bg-yellow-200/40" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-yellow-200/70 font-bold">{category}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-xs text-white/40 font-light tracking-wide leading-relaxed max-w-sm">
          {subtitle}
        </p>
      </motion.div>
    </section>
  );
};

export default PageHeader;
