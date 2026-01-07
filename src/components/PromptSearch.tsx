"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function PromptSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }
        
        startTransition(() => {
            router.push(`/prompts?${params.toString()}`);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors ${isPending ? 'text-blue-500 animate-pulse' : 'text-white/20 group-focus-within:text-white/60'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the neural codex..."
          className="block w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all backdrop-blur-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Decorative line below search */}
      <div className="absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
    </div>
  );
}
