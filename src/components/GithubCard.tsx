import { ExternalLink, Github, ArrowRight } from "lucide-react";
import Image from "next/image";

interface GithubCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  tags?: { id: string; name: string; slug: string }[];
}

export default function GithubCard({ title, description, url, imageUrl, tags = [] }: GithubCardProps) {
  // Deterministic gradient based on title
  const gradients = [
    "from-slate-800 to-zinc-900",
    "from-zinc-800 to-neutral-900",
    "from-stone-800 to-stone-900",
    "from-gray-800 to-slate-900",
  ];
  const gradientIndex = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  const selectedGradient = gradients[gradientIndex];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col h-[420px] w-full bg-[#050505] rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-900/5"
    >
      {/* Top Image Section */}
      <div className="relative h-48 w-full border-b border-white/5 bg-white/5 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100 grayscale group-hover:grayscale-0"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${selectedGradient} relative`}>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
             <Github className="w-12 h-12 text-white/10 z-10 group-hover:text-white/20 transition-colors" />
          </div>
        )}
        
        {/* Overlay Badge */}
        <div className="absolute top-4 right-4 z-10">
           <div className="p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white/60 group-hover:text-white transition-colors hover:bg-white/10">
              <ExternalLink className="w-4 h-4" />
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
           <div className="p-1.5 rounded bg-white/5 border border-white/10">
             <Github className="w-3 h-3 text-white/80" />
           </div>
           <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Open Source</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 font-mono tracking-tight group-hover:text-blue-200 transition-colors truncate">
          {title}
        </h3>

        <p className="text-sm text-white/50 leading-relaxed font-light line-clamp-2 mb-3">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span 
                  key={tag.id}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/40 font-mono"
                >
                  {tag.name}
                </span>
              ))}
            </div>
        )}

        {/* Footer - Simplified */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/30 group-hover:text-white/60 transition-colors">
           <span>View Codebase</span>
           <ArrowRight className="w-3 h-3 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
        </div>
      </div>
    </a>
  );
}
