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
    const icons: any = LucideIcons;
    
    // 1. Direct match
    if (icons[name]) return icons[name];

    // 2. PascalCase match (e.g. "layout-grid" -> "LayoutGrid" or "cpu" -> "Cpu")
    // Simple converter: capitalize first letter of each word
    const pascalName = name
        .replace(/(^\w|-\w)/g, (clear) => clear.replace(/-/, "").toUpperCase());
    
    if (icons[pascalName]) return icons[pascalName];

    // 3. Case-insensitive search (slower but fallback)
    const lowerName = name.toLowerCase().replace(/-/g, "");
    const foundKey = Object.keys(icons).find(key => key.toLowerCase() === lowerName);
    if (foundKey) return icons[foundKey];

    return null;
  };

  // Static top items
  const mainItems = [
      { label: "Explore", href: "/", icon: Compass },
      { label: "Benchmarks", href: "/benchmarks", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 h-full border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col py-6 px-4 fixed left-0 top-0 z-50">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        
        {/* Main Navigation */}
        <h2 className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-bold mb-3 pl-3">
          Discover
        </h2>
        <nav className="space-y-0.5 mb-6">
            {mainItems.map((item) => {
                const iconColor = getIconColor(item.label);
                return (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all duration-300 group
                      ${
                          isActiveLink(item.href)
                          ? "bg-white/10 text-white"
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                  >
                      <item.icon
                          className={`size-3.5 transition-transform duration-300 ${iconColor} ${
                              isActiveLink(item.href) ? "scale-110 opacity-100" : "opacity-70 group-hover:scale-110 group-hover:opacity-100"
                          }`}
                      />
                      <span className="text-[11px] tracking-wide font-medium">{item.label}</span>
                      {isActiveLink(item.href) && (
                          <div className="ml-auto w-1 h-1 rounded-full bg-yellow-200 shadow-[0_0_8px_rgba(254,249,195,0.8)]" />
                      )}
                  </Link>
                );
            })}
        </nav>

        {/* Dynamic Sections */}
        {sections.map((section) => (
            <div key={section.id} className="mb-6">
                 <h2 className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-bold mb-3 pl-3">
                    {section.title}
                </h2>
                <nav className="space-y-0.5">
                    {section.categories.map((cat) => {
                        const href = `/${cat.slug}`; // Dynamic routing
                        const active = isActiveLink(href);
                        const iconColor = getIconColor(cat.name); // Generate consistent color

                        return (
                            <Link
                                key={cat.id}
                                href={href}
                                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all duration-300 group
                                ${
                                    active
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {cat.iconUrl ? (
                                    <div className={`relative w-3.5 h-3.5 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>
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
                                            return <IconComponent 
                                                className={`size-3.5 transition-transform duration-300 ${iconColor} ${
                                                    active ? "scale-110 opacity-100" : "opacity-70 group-hover:scale-110 group-hover:opacity-100"
                                                }`}
                                            />;
                                        }
                                        return <Hash
                                            className={`size-3.5 transition-transform duration-300 ${iconColor} ${
                                                active ? "scale-110 opacity-100" : "opacity-70 group-hover:scale-110 group-hover:opacity-100"
                                            }`}
                                        />;
                                    })()
                                )}
                                <span className="text-[11px] tracking-wide font-medium truncate">{cat.name}</span>
                                {active && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-yellow-200 shadow-[0_0_8px_rgba(254,249,195,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        ))}
      </div>

      {/* Footer / Admin Link */}
      <div className="mt-2 pt-4 border-t border-white/5 space-y-1.5">
        <Link
          href="/submit"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 group"
        >
          <Send className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          <span className="text-[10px] tracking-widest font-bold uppercase">
            Submit Tool
          </span>
        </Link>

        <Link
          href="/admin"
          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all duration-300 group
            ${
              pathname.startsWith("/admin")
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }
          `}
        >
          <ShieldAlert
            className={`size-3.5 transition-transform duration-300 ${
              pathname.startsWith("/admin") ? "scale-110" : "group-hover:scale-110"
            }`}
          />
          <span className="text-[11px] tracking-wide font-medium">
            Admin Access
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default SidebarClient;
