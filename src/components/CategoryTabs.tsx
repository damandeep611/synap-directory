"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CategoryTab {
  name: string;
  slug: string;
}

interface CategoryTabsProps {
  categories: CategoryTab[];
  compact?: boolean;
}

export default function CategoryTabs({ categories, compact = false }: CategoryTabsProps) {
  const pathname = usePathname();
  const isAll = pathname === "/";

  const pillClass = compact
    ? "px-3 py-1 text-[12px]"
    : "px-3.5 py-1.5 text-[13px]";

  const gapClass = compact ? "gap-2 px-6 py-2.5" : "gap-2 px-6 py-3";

  return (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className={`flex items-center ${gapClass} overflow-x-auto no-scrollbar scroll-smooth`}>
        <Link
          href="/"
          className={`shrink-0 ${pillClass} rounded-full font-medium transition-all duration-200 shadow-sm
            ${
              isAll
                ? "bg-white text-zinc-950 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-white"
                : "bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20"
            }`}
        >
          All
        </Link>
        {categories.map((cat) => {
          const href = `/${cat.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={cat.slug}
              href={href}
              className={`shrink-0 ${pillClass} rounded-full font-medium transition-all duration-200 shadow-sm
                ${
                  isActive
                    ? "bg-white text-zinc-950 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-white"
                    : "bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20"
                }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
