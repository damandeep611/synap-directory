import Image from "next/image";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

interface ArticleCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  createdAt: Date;
}

export default function ArticleCard({ title, description, url, imageUrl, createdAt }: ArticleCardProps) {
  // Format date as "OCT 24, 2024"
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-[480px] bg-[#050505] rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl"
    >
      {/* Image Container - Takes up top portion */}
      <div className="relative h-[55%] w-full overflow-hidden bg-white/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-black">
            <BookOpen className="w-12 h-12 text-purple-500/20" />
          </div>
        )}
        
        {/* Category Badge Overlay */}
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 bg-purple-900/90 backdrop-blur-md border border-purple-500/20 rounded text-[10px] font-bold tracking-widest text-purple-100 uppercase">
            Article
          </span>
        </div>
        
        {/* Gradient Overlay for Text Readability at bottom of image if needed, though design has text below */}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-6 relative">
        {/* Metadata */}
        <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-white/40 mb-3 uppercase">
          <span>{formattedDate}</span>
          <span className="w-0.5 h-0.5 bg-white/40 rounded-full" />
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            5 MIN
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-3 leading-tight group-hover:text-purple-300 transition-colors line-clamp-2">
            {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/50 leading-relaxed line-clamp-3 mb-6 font-light">
          {description}
        </p>

        {/* Footer / Author Placeholder */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
           <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
             Read Article
           </span>
           <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-purple-300 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </a>
  );
}
