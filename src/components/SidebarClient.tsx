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
}

interface SidebarSection {
  id: string;
  title: string;
  slug: string;
  categories: Category[];
}

interface SidebarClientProps {
  sections: SidebarSection[];
}

const SidebarClient: React.FC<SidebarClientProps> = ({ sections }) => {
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
    { label: "Explore", href: "/", icon: Compass },
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
        <nav className={`space-y-0.5 mb-5 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          {mainItems.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : ""}
                className={`flex items-center gap-2.5 py-2 rounded-lg transition-all duration-200 group
                      ${isCollapsed ? "px-2 justify-center" : "w-full px-3"}
                      ${
                        active
                          ? "text-white font-medium bg-white/[0.06]"
                          : "text-zinc-500 hover:text-zinc-200"
                      }`}
              >
                <item.icon
                  className={`size-[16px] transition-colors duration-200 ${
                    active
                      ? "text-white"
                      : "text-zinc-600 group-hover:text-zinc-300"
                  }`}
                />
                {!isCollapsed && <span className="text-[13px]">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Sections */}
        {sections.map((section) => (
          <div key={section.id} className="mb-4">
            {!isCollapsed && (
              <h2 className="text-[11px] tracking-[0.12em] uppercase text-zinc-600 font-medium mb-2 px-3">
                {section.title}
              </h2>
            )}
            <nav className={`space-y-0.5 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
              {section.categories.map((cat) => {
                const href = `/${cat.slug}`;
                const active = isActiveLink(href);

                return (
                  <Link
                    key={cat.id}
                    href={href}
                    title={isCollapsed ? cat.name : ""}
                    className={`flex items-center gap-2.5 py-1.5 rounded-lg transition-all duration-200 group
                                ${isCollapsed ? "px-2 justify-center" : "w-full px-3"}
                                ${
                                  active
                                    ? "text-white font-medium bg-white/[0.06]"
                                    : "text-zinc-500 hover:text-zinc-200"
                                }`}
                  >
                    {cat.iconUrl ? (
                      <div
                        className={`relative w-4 h-4 transition-opacity duration-200 ${
                          active ? "opacity-100" : "opacity-50 group-hover:opacity-80"
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
                        return (
                          <Icon
                            className={`size-[15px] transition-colors duration-200 ${
                              active
                                ? "text-white"
                                : "text-zinc-600 group-hover:text-zinc-400"
                            }`}
                          />
                        );
                      })()
                    )}
                    {!isCollapsed && <span className="text-[13px] truncate">{cat.name}</span>}
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
          className={`flex items-center gap-2.5 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 transition-all duration-200 group
            ${isCollapsed ? "px-2 justify-center" : "w-full px-3"}
          `}
        >
          <Send className="size-[15px] group-hover:translate-x-0.5 transition-transform text-zinc-600 group-hover:text-zinc-400" />
          {!isCollapsed && (
            <span className="text-[13px]">
              Submit a tool
            </span>
          )}
        </Link>

        <Link
          href="/admin"
          title={isCollapsed ? "Admin Access" : ""}
          className={`flex items-center gap-2.5 py-2 rounded-lg transition-all duration-200 group
            ${isCollapsed ? "px-2 justify-center" : "w-full px-3"}
            ${
              pathname.startsWith("/admin")
                ? "text-white font-medium bg-white/[0.06]"
                : "text-zinc-500 hover:text-zinc-200"
            }
          `}
        >
          <ShieldAlert
            className={`size-[15px] transition-colors duration-200 ${
              pathname.startsWith("/admin")
                ? "text-red-400"
                : "text-zinc-600 group-hover:text-red-400/70"
            }`}
          />
          {!isCollapsed && <span className="text-[13px]">Admin Access</span>}
        </Link>
      </div>
    </aside>
  );
};

export default SidebarClient;
