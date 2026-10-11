"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
  Compass,
  ShieldAlert,
  Send,
  BarChart3,
  Terminal,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  iconName?: string | null;
  count?: number;
}

interface SidebarSection {
  id: string;
  title: string;
  slug: string;
  categories: Category[];
}

interface SidebarClientProps {
  sections: SidebarSection[];
  totalCount?: number;
}

// Curated palette of modern dark-mode accent colors for active category icon badges
const ACCENT_COLORS = [
  { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" }, // Gold/Amber matching user's reference
  { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
  { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
  { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
  { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/30" },
  { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", border: "border-fuchsia-500/30" },
  { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30" },
];

function getCategoryAccent(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % ACCENT_COLORS.length;
  return ACCENT_COLORS[index];
}

const SidebarClient: React.FC<SidebarClientProps> = ({ sections, totalCount }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update CSS variable when collapsed state changes
  useEffect(() => {
    const root = document.documentElement;
    if (isCollapsed) {
      root.style.setProperty("--sidebar-width", "var(--sidebar-collapsed-width)");
    } else {
      root.style.setProperty("--sidebar-width", "256px");
    }
  }, [isCollapsed]);

  const isActiveLink = (href: string) => pathname === href;

  // Helper to resolve icon dynamically (case-insensitive)
  const getDynamicIcon = (name: string | null | undefined) => {
    if (!name) return null;
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;

    // 1. Direct match
    if (icons[name]) return icons[name];

    // 2. PascalCase match (e.g. "layout-grid" -> "LayoutGrid" or "cpu" -> "Cpu")
    const pascalName = name.replace(/(^\w|-\w)/g, (clear) =>
      clear.replace(/-/, "").toUpperCase()
    );

    if (icons[pascalName]) return icons[pascalName];

    // 3. Case-insensitive search (slower but fallback)
    const lowerName = name.toLowerCase().replace(/-/g, "");
    const foundKey = Object.keys(icons).find(
      (key) => key.toLowerCase() === lowerName
    );
    if (foundKey) return icons[foundKey];

    return null;
  };

  // Static top items
  const mainItems = [
    { label: "Explore", href: "/", icon: Compass, count: totalCount },
    { label: "Benchmarks", href: "/benchmarks", icon: BarChart3 },
    { label: "Prompt Base", href: "/prompts", icon: Terminal },
  ];

  return (
    <aside
      className={`h-full bg-[#111111] flex flex-col py-5 fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 size-6 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors z-[60]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo / Brand */}
      <div className={`mb-6 ${isCollapsed ? "px-2 flex justify-center" : "px-5"}`}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Zap className="size-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-[15px] font-semibold text-white tracking-tight">
              Synap<span className="text-zinc-500">Directory</span>
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2">
        {/* Main Navigation */}
        {!isCollapsed && (
          <h2 className="text-[11px] tracking-[0.12em] uppercase text-zinc-600 font-medium mb-2 px-3">
            Browse
          </h2>
        )}
        <nav className={`space-y-1 mb-5 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          {mainItems.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? `${item.label}${typeof item.count === "number" ? ` (${item.count})` : ""}` : ""}
                className={`flex items-center transition-all duration-200 group
                      ${isCollapsed ? "px-1.5 py-1 justify-center rounded-lg" : "w-full px-2 py-1 rounded-lg gap-2"}
                      ${
                        active
                          ? "bg-[#222222] border border-white/5 shadow-sm text-white"
                          : "hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 border border-transparent"
                      }`}
              >
                <div
                  className={`size-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
                    active
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-zinc-800/50 border border-white/5 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800/80"
                  }`}
                >
                  <item.icon className="size-[13px]" />
                </div>
                {!isCollapsed && (
                  <>
                    <span
                      className={`text-[12.5px] truncate flex-1 text-left transition-colors duration-200 ${
                        active ? "text-white font-medium" : "text-zinc-300 group-hover:text-white font-normal"
                      }`}
                    >
                      {item.label}
                    </span>
                    {typeof item.count === "number" && (
                      <span
                        className={`text-[11.5px] tabular-nums shrink-0 ml-auto transition-colors duration-200 ${
                          active ? "text-zinc-300 font-medium" : "text-zinc-500 group-hover:text-zinc-400 font-normal"
                        }`}
                      >
                        {item.count.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Sections */}
        {sections.map((section) => (
          <div key={section.id} className="mb-5">
            {!isCollapsed && (
              <h2 className="text-[11px] tracking-[0.12em] uppercase text-zinc-600 font-medium mb-2 px-3">
                {section.title}
              </h2>
            )}
            <nav className={`space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
              {section.categories.map((cat) => {
                const href = `/${cat.slug}`;
                const active = isActiveLink(href);
                const accent = getCategoryAccent(cat.slug || cat.id);

                return (
                  <Link
                    key={cat.id}
                    href={href}
                    title={isCollapsed ? `${cat.name} (${cat.count ?? 0})` : ""}
                    className={`flex items-center transition-all duration-200 group
                                ${isCollapsed ? "px-1.5 py-1 justify-center rounded-lg" : "w-full px-2 py-1 rounded-lg gap-2"}
                                ${
                                  active
                                    ? "bg-[#222222] border border-white/5 shadow-sm"
                                    : "hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 border border-transparent"
                                }`}
                  >
                    {/* Left Icon Badge Container */}
                    <div
                      className={`size-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
                        active
                          ? `${accent.bg} ${accent.text} border ${accent.border}`
                          : "bg-zinc-800/50 border border-white/5 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800/80"
                      }`}
                    >
                      {cat.iconUrl ? (
                        <div
                          className={`relative w-3.5 h-3.5 transition-opacity duration-200 ${
                            active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={cat.iconUrl}
                            alt={cat.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        (() => {
                          const IconComponent = getDynamicIcon(cat.iconName);
                          const Icon = IconComponent || LucideIcons.Hash;
                          return <Icon className="size-[13px]" />;
                        })()
                      )}
                    </div>

                    {/* Category Label and Count */}
                    {!isCollapsed && (
                      <>
                        <span
                          className={`text-[12.5px] truncate flex-1 text-left transition-colors duration-200 ${
                            active
                              ? "text-white font-medium"
                              : "text-zinc-300 group-hover:text-white font-normal"
                          }`}
                        >
                          {cat.name}
                        </span>
                        <span
                          className={`text-[11.5px] tabular-nums shrink-0 ml-auto transition-colors duration-200 ${
                            active
                              ? "text-zinc-300 font-medium"
                              : "text-zinc-500 group-hover:text-zinc-400 font-normal"
                          }`}
                        >
                          {(cat.count ?? 0).toLocaleString()}
                        </span>
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`mt-2 pt-4 border-t border-white/5 px-2 space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        <Link
          href="/submit"
          title={isCollapsed ? "Submit a tool" : ""}
          className={`flex items-center transition-all duration-200 group
            ${isCollapsed ? "px-1.5 py-1 justify-center rounded-lg" : "w-full px-2 py-1 rounded-lg gap-2"}
            ${
              isActiveLink("/submit")
                ? "bg-[#222222] border border-white/5 shadow-sm text-white"
                : "hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 border border-transparent"
            }
          `}
        >
          <div className="size-7 rounded-md bg-zinc-800/50 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-200 transition-colors">
            <Send className="size-[13px] group-hover:translate-x-0.5 transition-transform" />
          </div>
          {!isCollapsed && (
            <span className="text-[12.5px] flex-1 text-left text-zinc-300 group-hover:text-white">
              Submit a tool
            </span>
          )}
        </Link>

        <Link
          href="/admin"
          title={isCollapsed ? "Admin Access" : ""}
          className={`flex items-center transition-all duration-200 group
            ${isCollapsed ? "px-1.5 py-1 justify-center rounded-lg" : "w-full px-2 py-1 rounded-lg gap-2"}
            ${
              pathname.startsWith("/admin")
                ? "bg-[#222222] border border-white/5 shadow-sm text-white font-medium"
                : "hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 border border-transparent"
            }
          `}
        >
          <div
            className={`size-7 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-red-500/15 border-red-500/25 text-red-400"
                : "bg-zinc-800/50 border-white/5 text-zinc-400 group-hover:text-red-400/80 group-hover:bg-zinc-800/80"
            }`}
          >
            <ShieldAlert className="size-[13px]" />
          </div>
          {!isCollapsed && (
            <span className="text-[12.5px] flex-1 text-left text-zinc-300 group-hover:text-white">
              Admin Access
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
};

export default SidebarClient;
