"use client"

import React from 'react';
import { 
  Wrench, 
  Youtube, 
  Sparkles, 
  GitBranch, 
  Cpu, 
  FileText,
  BookOpen,
  Compass,
  ShieldAlert,

  Briefcase,
  Github,
  Server,
  Palette
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const items: SidebarItem[] = [
  { id: 'explore', label: 'Explore', icon: Compass },
   { id: 'articles', label: 'Articles', icon: BookOpen },
   { id: 'gen-ai', label: 'Gen AI Tools', icon: Sparkles },
  { id: 'apps-and-tools', label: 'Apps & Tools', icon: Wrench },
  { id: 'md', label: '.Md Files', icon: FileText },
    { id: 'design', label: 'Design', icon: Palette },
  { id: 'portfolios', label: 'Portfolios', icon: Briefcase },
  { id: 'github', label: 'Github Repos', icon: Github },
  { id: 'backend', label: 'Backend Tools', icon: Server },
  { id: 'youtube', label: 'Youtube Channels', icon: Youtube },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'mcp', label: 'MCP', icon: Cpu },
  { id: 'admin', label: 'Admin', icon: ShieldAlert },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-72 h-full border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col py-8 px-6">
      <div className="mb-12">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-semibold mb-6 pl-4">Directory</h2>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-300 group
                  ${isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon className={`size-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-xs tracking-wider font-medium ">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-yellow-200 shadow-[0_0_8px_rgba(254,249,195,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto pl-4">
        <div className="p-4 rounded-xl border border-white/5 bg-white/5">
          <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">
            SynapDirectory v1.0<br/>
            Registry Active
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
