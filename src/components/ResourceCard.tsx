import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  label?: string;
  date?: Date;
}

export default function ResourceCard({
  title,
  description,
  url,
  imageUrl,
  label = "Resource",
  date,
}: ResourceCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-95 w-full bg-[#121212] rounded-3xl overflow-hidden border border-white/8 hover:border-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50"
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
          <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
            <span className="text-white/10 font-medium text-4xl select-none">
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Bottom 45% */}
      <div className="flex-1 flex flex-col justify-between p-6">
        <div>
          <h3 className="text-xl font-semibold text-white tracking-tight mb-2 group-hover:text-yellow-100 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 font-medium">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/6">
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
