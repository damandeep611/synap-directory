import Image from "next/image";
import { ExternalLink, Wrench } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  createdAt: Date;
}

export default function ToolCard({ title, description, url, imageUrl, createdAt }: ToolCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-6 border border-white/10 rounded-2xl bg-[#0A0A0A] hover:bg-white/2 hover:border-white/20 transition-all duration-300 cursor-pointer group flex flex-col h-120 shadow-2xl relative overflow-hidden"
    >
      <div className="w-full h-48 bg-black/50 rounded-xl mb-6 overflow-hidden relative border border-white/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || "Tool"}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
            <Wrench className="w-8 h-8 text-white/10" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-widest font-mono text-blue-300/60 border border-white/10 px-2 py-0.5 rounded">
          Tool
        </span>
        <span className="text-[10px] text-white/20 font-mono">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      <h3 className="text-xl font-serif font-bold tracking-tight mb-3 text-white group-hover:text-blue-300 transition-colors line-clamp-2">
        {title}
      </h3>

      <p className="text-sm text-white/40 leading-relaxed line-clamp-3 mb-6 grow font-light">
        {description}
      </p>

      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">
        <span>Launch Tool</span>
        <ExternalLink className="w-3 h-3" />
      </div>
    </a>
  );
}
