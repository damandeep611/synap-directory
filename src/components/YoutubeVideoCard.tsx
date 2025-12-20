import Image from "next/image";
import { Play } from "lucide-react";

interface YoutubeVideoCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  date?: Date;
}

export default function YoutubeVideoCard({
  title,
  description,
  url,
  imageUrl,
  date,
}: YoutubeVideoCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-80 w-full bg-[#121212] rounded-2xl overflow-hidden border border-white/10 hover:border-red-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/10"
    >
      {/* Thumbnail Section */}
      <div className="relative h-[60%] w-full overflow-hidden bg-black">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <Play className="w-12 h-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-red-600/90 text-white p-3 rounded-full backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform">
                <Play className="w-6 h-6 fill-current" />
            </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-red-200 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
          {description}
        </p>
      </div>
    </a>
  );
}
