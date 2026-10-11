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
    ? "px-3 py-1 text-[11px]"
    : "px-4 py-1.5 text-[13px]";

  const gapClass = compact ? "gap-1.5 px-6 py-2" : "gap-2 px-6 py-3";

  return (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className={`flex items-center ${gapClass} overflow-x-auto no-scrollbar`}>
        <Link
          href="/"
          className={`shrink-0 ${pillClass} rounded-full font-medium transition-all duration-200
            ${
              isAll
                ? "bg-zinc-700 text-white"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
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
              className={`shrink-0 ${pillClass} rounded-full font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
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
