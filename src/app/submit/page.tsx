"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, TrendingUp, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import MarkdownSubmissionForm from '@/components/MarkdownSubmissionForm';

export default function SubmitPage() {
  return (
    <div className="min-h-full w-full bg-black text-white selection:bg-yellow-200/30 selection:text-yellow-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-600/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 py-24">
        
        {/* Header Section */}
        <div className="max-w-4xl mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-yellow-200/80">Partnership Program</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight mb-8 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
              Elevate Your <br/> Innovation.
            </h1>
            
            <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-2xl border-l border-white/10 pl-8">
              SynapDirectory is the premier destination for synthetic intelligence tools. 
              Partner with us to position your product before a dedicated audience of pioneers, developers, and decision-makers.
            </p>
          </motion.div>
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: Globe,
              title: "Global Visibility",
              desc: "Reach a curated, international audience actively seeking next-gen AI solutions."
            },
            {
              icon: TrendingUp,
              title: "High-Intent Traffic",
              desc: "Connect with users who are ready to adopt and integrate new technologies into their workflows."
            },
            {
              icon: ShieldCheck,
              title: "Brand Authority",
              desc: "Situate your tool alongside the industry's most respected and verified resources."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-yellow-200 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-white/90">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action / Pricing Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.05] to-black"
        >
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-200/50 to-transparent" />
           
           <div className="p-12 md:p-20 text-center">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/10 text-yellow-300 mb-8">
               <Zap className="w-8 h-8" />
             </div>
             
             <h2 className="text-4xl md:text-5xl font-serif italic mb-6">Ready to launch?</h2>
             <p className="text-white/50 max-w-xl mx-auto mb-10 text-lg">
               Submit your tool for review. Selected partners receive premium placement and featured editorial coverage.
             </p>

             <button className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-white px-10 font-medium text-black transition-all duration-300 hover:bg-yellow-200 hover:w-64 w-56">
               <span className="mr-2">Apply Now</span>
               <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
               <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-200 via-white to-yellow-200 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
             </button>

             <p className="mt-6 text-xs text-white/30 uppercase tracking-widest">
               Limited slots available for Q1 2026
             </p>
           </div>
        </motion.div>

        {/* Markdown Submission Section */}
        <MarkdownSubmissionForm />

      </div>
    </div>
  );
}