"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  category?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  category = "Directory",
  children,
}) => {
  return (
    <section className="relative w-full pt-20 pb-16 px-6 md:px-12 overflow-hidden bg-[#050505] border-b border-white/10">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Top Row: Meta & Breadcrumbs */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="h-px w-8 bg-white/20" />
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-white/50 font-mono">
            <Link href="/" className="hover:text-white transition-colors">Synap</Link>
            <span>/</span>
            <span className="text-white/80">{category}</span>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 lg:items-end justify-between">
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
              {title}
              <span className="text-blue-500">.</span>
            </h1>
            
            <div className="flex flex-col md:flex-row gap-6 md:items-start">
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 shrink-0 md:block hidden" />
              <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </div>
          </motion.div>

          {/* Right/Bottom: Actions & Children */}
          {children && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="shrink-0"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;