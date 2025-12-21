import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  label?: string;
  date?: Date;
  tags?: { id: string; name: string; slug: string }[];
}

export default function ResourceCard({
  title,
  description,
  url,
  imageUrl,
  label = "Resource",
  date,
  tags = [],
}: ResourceCardProps) {
  // Deterministic gradient based on title
  const gradients = [
    "from-pink-500/20 to-violet-600/20 text-pink-200",
    "from-blue-500/20 to-cyan-400/20 text-blue-200",
    "from-emerald-500/20 to-teal-400/20 text-emerald-200",
    "from-orange-500/20 to-amber-400/20 text-orange-200",
    "from-indigo-500/20 to-purple-500/20 text-indigo-200",
    "from-rose-500/20 to-red-400/20 text-rose-200",
  ];
  
  const gradientIndex = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  const selectedGradient = gradients[gradientIndex];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-[420px] w-full bg-[#121212] rounded-3xl overflow-hidden border border-white/8 hover:border-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50"
    >
      {/* Media Section - Top 55% */}
      <div className="relative h-[55%] w-full overflow-hidden bg-[#0A0A0A]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${selectedGradient}`}>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <span className="text-4xl font-serif italic font-medium opacity-50 select-none">
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Bottom 45% */}
      <div className="flex-1 flex flex-col justify-between p-6 overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-white tracking-tight group-hover:text-yellow-100 transition-colors truncate">
              {title}
            </h3>
          </div>
          
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 font-medium mb-3">
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span 
                  key={tag.id}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-500 font-medium"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              {label}
            </span>
            {date && (
              <span className="text-[10px] text-zinc-600 font-mono">
                {new Date(date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors duration-300">
            <span className="text-xs font-medium">Visit</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </a>
  );
}
