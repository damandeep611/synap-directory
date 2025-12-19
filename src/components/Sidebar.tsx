"use client"

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  ShieldAlert,
  Send,
  BarChart3,
  Youtube
} from 'lucide-react';
import { CATEGORY_SIDEBAR_ITEMS, SidebarItem } from '@/utils/sidebar-constants';

const mainItems: SidebarItem[] = [
  { id: 'explore', label: 'Explore', icon: Compass, href: '/' },
  { id: 'articles', label: 'Articles', icon: CATEGORY_SIDEBAR_ITEMS.find(i => i.id === 'articles')?.icon, href: '/articles' },
  { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3, href: '/benchmarks' },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const renderItem = (item: SidebarItem) => {
    const Icon = item.icon || Compass; // Fallback
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-300 group
          ${
            isActive
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }
        `}
      >
        <Icon
          className={`size-4 transition-transform duration-300 ${
            isActive ? "scale-110" : "group-hover:scale-110"
          }`}
        />
        <span className="text-xs tracking-wider font-medium ">
          {item.label}
        </span>
        {isActive && (
          <div className="ml-auto w-1 h-1 rounded-full bg-yellow-200 shadow-[0_0_8px_rgba(254,249,195,0.8)]" />
        )}
      </Link>
    );
  };

  // Filter out items that are already in main items or special/excluded
  const directoryItems = CATEGORY_SIDEBAR_ITEMS.filter(item => 
    item.id !== 'articles' // Articles is in main
  ).concat({ id: 'youtube', label: 'Youtube Channels', icon: Youtube, href: '/youtube' }); // Youtube is separate as per request

  return (
    <aside className="w-64 h-full border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col py-8 px-6 fixed left-0 top-0 z-50">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-semibold mb-6 pl-4">
          Discover
        </h2>
        <nav className="space-y-2 mb-8">{mainItems.map(renderItem)}</nav>

        <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-semibold mb-6 pl-4">
          Directory
        </h2>
        <nav className="space-y-2">{directoryItems.map(renderItem)}</nav>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
        <Link
          href="/submit"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 group"
        >
          <Send className="size-4 group-hover:translate-x-1 transition-transform" />
          <span className="text-xs tracking-wider font-medium uppercase">
            Submit Tool
          </span>
        </Link>

        <Link
          href="/admin"
          className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-300 group
            ${
              pathname === "/admin"
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }
          `}
        >
          <ShieldAlert
            className={`size-4 transition-transform duration-300 ${
              pathname === "/admin" ? "scale-110" : "group-hover:scale-110"
            }`}
          />
          <span className="text-xs tracking-wider font-medium">
            Admin Access
          </span>
          {pathname === "/admin" && (
            <div className="ml-auto w-1 h-1 rounded-full bg-yellow-200 shadow-[0_0_8px_rgba(254,249,195,0.8)]" />
          )}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
