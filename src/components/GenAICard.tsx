import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface GenAICardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
}

export default function GenAICard({ title, description, url, imageUrl }: GenAICardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col h-[500px] w-full overflow-hidden rounded-3xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-60 mix-blend-overlay"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-[#0A0A0A] to-black opacity-80" />
        )}
        
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
        
        {/* Top Action Icon */}
        <div className="self-end opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-auto space-y-6">
          {/* Title Section */}
          <div className="space-y-2">
            <h3 className="text-3xl md:text-4xl font-sans font-medium text-white tracking-tight leading-tight group-hover:text-white transition-colors">
              {title}
            </h3>
            <div className="h-0.5 w-12 bg-purple-500/50 rounded-full group-hover:w-24 transition-all duration-500 ease-out" />
          </div>

          {/* Description */}
          <p className="text-base text-white/60 font-light leading-relaxed line-clamp-3 max-w-md">
            {description}
          </p>
          
          {/* Subtle Call to Action */}
          <div className="pt-2 flex items-center gap-2 text-sm text-white/40 font-medium tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span>Explore Tool</span>
            <div className="w-8 h-[1px] bg-white/20" />
          </div>
        </div>
      </div>
    </a>
  );
}