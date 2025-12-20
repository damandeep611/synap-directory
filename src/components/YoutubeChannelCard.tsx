import Image from "next/image";
import { ExternalLink, Tv } from "lucide-react";

interface YoutubeChannelCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
}

export default function YoutubeChannelCard({
  title,
  description,
  url,
  imageUrl,
}: YoutubeChannelCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 w-full bg-[#121212] rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300 hover:bg-[#1A1A1A]"
    >
      <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-full overflow-hidden border border-white/10 bg-zinc-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <Tv className="w-6 h-6 text-white/20" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm md:text-base font-semibold text-white truncate group-hover:text-red-200 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 truncate mt-0.5">
            {description || "YouTube Channel"}
        </p>
      </div>

      <div className="text-white/20 group-hover:text-white transition-colors">
        <ExternalLink className="w-4 h-4" />
      </div>
    </a>
  );
}
