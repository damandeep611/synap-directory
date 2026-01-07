"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
  Compass,
  ShieldAlert,
  Send,
  BarChart3,
  Hash,
  Terminal,
  LucideIcon,
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

  const isActiveLink = (href: string) => pathname === href;

  // Deterministic color generator based on string hash
  const getIconColor = (id: string) => {
    const colors = [
      "text-blue-400",
      "text-emerald-400",
      "text-purple-400",
      "text-rose-400",
      "text-amber-400",
      "text-cyan-400",
      "text-fuchsia-400",
      "text-indigo-400",
      "text-teal-400",
      "text-lime-400",
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Helper to resolve icon dynamically (case-insensitive)
  const getDynamicIcon = (name: string | null | undefined) => {
    if (!name) return null;
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;

    // 1. Direct match
    if (icons[name]) return icons[name];

    // 2. PascalCase match (e.g. "layout-grid" -> "LayoutGrid" or "cpu" -> "Cpu")
    // Simple converter: capitalize first letter of each word
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
    <aside className="w-64 h-full border-r border-white/5 bg-zinc-900 flex flex-col py-6 px-4 fixed left-0 top-0 z-50">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Main Navigation */}
        <h2 className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 font-bold mb-3 pl-3">
          Discover
        </h2>
        <nav className="space-y-1 mb-4">
          {mainItems.map((item) => {
            const iconColor = getIconColor(item.label);
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                      ${
                        active
                          ? "bg-zinc-800 text-zinc-100 font-medium"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                      }`}
              >
                <item.icon
                  className={`size-4 transition-transform duration-300 ${iconColor} ${
                    active
                      ? "opacity-100"
                      : "opacity-60 group-hover:opacity-100 group-hover:scale-110"
                  }`}
                />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Sections */}
        {sections.map((section) => (
          <div key={section.id} className="mb-2 ">
            <h2 className="text-[10px] tracking-[0.15em] uppercase text-zinc-400 font-bold mb-2 pl-3">
              {section.title}
            </h2>
            <nav className="space-y-1">
              {section.categories.map((cat) => {
                const href = `/${cat.slug}`; // Dynamic routing
                const active = isActiveLink(href);
                const iconColor = getIconColor(cat.name); // Generate consistent color

                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 group
                                ${
                                  active
                                    ? "bg-zinc-800 text-zinc-100 font-medium"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                                }`}
                  >
                    {cat.iconUrl ? (
                      <div
                        className={`relative w-4 h-4 transition-transform duration-300 ${
                          active ? "" : "group-hover:scale-110"
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
                        if (IconComponent) {
                          return (
                            <IconComponent
                              className={`size-4 transition-transform duration-300 ${iconColor} ${
                                active
                                  ? "opacity-100"
                                  : "opacity-60 group-hover:opacity-100 group-hover:scale-110"
                              }`}
                            />
                          );
                        }
                        return (
                          <Hash
                            className={`size-4 transition-transform duration-300 ${iconColor} ${
                              active
                                ? "opacity-100"
                                : "opacity-60 group-hover:opacity-100 group-hover:scale-110"
                            }`}
                          />
                        );
                      })()
                    )}
                    <span className="text-sm truncate">{cat.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / Admin Link */}
      <div className="mt-2 pt-4 border-t border-white/5 space-y-2">
        <Link
          href="/submit"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-300 group"
        >
          <Send className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          <span className="text-[10px] tracking-widest font-bold uppercase">
            Submit Tool
          </span>
        </Link>

        <Link
          href="/admin"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
            ${
              pathname.startsWith("/admin")
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }
          `}
        >
          <ShieldAlert
            className={`size-4 transition-transform duration-300 ${
              pathname.startsWith("/admin")
                ? "text-red-400"
                : "text-zinc-500 group-hover:text-red-400 group-hover:scale-110"
            }`}
          />
          <span className="text-sm font-medium">Admin Access</span>
        </Link>
      </div>
    </aside>
  );
};

export default SidebarClient;
