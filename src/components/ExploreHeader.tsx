"use client"

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

interface ExploreHeaderProps {
  title: string;
  subtitle: string;
  category?: string;
  bgImage?: string;
}

const ExploreHeader: React.FC<ExploreHeaderProps> = ({ 
  title, 
  subtitle, 
  category = "The Archive", 
  bgImage 
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative w-full h-[50vh] min-h-[400px] flex items-end px-6 md:px-12 pb-16 overflow-hidden bg-[#050505] group">
      {/* Dynamic Background Layer */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80 z-10" />
        
        {bgImage ? (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Image 
              src={bgImage}
              alt={title}
              fill
              className="object-cover opacity-60 transition-transform duration-[20s] ease-linear group-hover:scale-110"
              priority
            />
          </motion.div>
        ) : (
          /* Fallback Abstract Background */
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050505] to-[#050505]" />
        )}
        
        {/* Grain Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay z-10 pointer-events-none" />
      </motion.div>

      {/* Content Layer */}
      <div className="relative z-20 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          
          {/* Main Title Block */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white/90 border border-white/10 backdrop-blur-md">
                {category}
              </span>
              <div className="h-px w-12 bg-white/20" />
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white leading-[0.9] mix-blend-lighten">
              {title}
            </h1>
          </motion.div>

          {/* Subtitle Block - Magazine Layout */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="md:max-w-xs lg:max-w-sm mb-2"
          >
            <p className="text-sm md:text-base text-white/70 font-light leading-relaxed border-l border-white/20 pl-4 backdrop-blur-sm">
              {subtitle}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExploreHeader;
