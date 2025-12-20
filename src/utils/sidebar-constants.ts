import {
  Wrench,
  Sparkles,
  GitBranch,
  Cpu,
  FileText,
  BookOpen,
  Briefcase,
  Github,
  Server,
  Palette,
  Library,
  Hammer,
  Youtube,
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: any;
  href: string;
}

// These are purely for the sidebar navigation UI
export const UI_ONLY_ITEMS = [
  { id: 'explore', label: 'Explore', href: '/' },
  { id: 'benchmarks', label: 'Benchmarks', href: '/benchmarks' },
];

// These are the categories that resources can be assigned to
export const CATEGORY_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "gen-ai", label: "Gen AI Tools", icon: Sparkles, href: "/gen-ai" },
  { id: "tools", label: "Tools", icon: Hammer, href: "/tools" },
  { id: "libraries", label: "Libraries", icon: Library, href: "/libraries" },
  { id: "md", label: ".Md Files", icon: FileText, href: "/md" },
  { id: "articles", label: "Articles", icon: BookOpen, href: "/articles" },
  { id: "design", label: "Design", icon: Palette, href: "/design" },
  { id: "portfolios", label: "Portfolios", icon: Briefcase, href: "/portfolios" },
  { id: "github", label: "Github Repos", icon: Github, href: "/github" },
  { id: "backend", label: "Backend Tools", icon: Server, href: "/backend" },
  { id: "workflows", label: "Workflows", icon: GitBranch, href: "/workflows" },
  { id: "mcp", label: "MCP", icon: Cpu, href: "/mcp" },
  { id: "youtube", label: "YouTube", icon: Youtube, href: "/youtube" },
];
