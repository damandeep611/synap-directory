import Image from "next/image";

interface ResourceCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  date?: Date;
  tags?: { id: string; name: string; slug: string }[];
}

export default function ResourceCard({
  title,
  description,
  url,
  imageUrl,
  tags = [],
}: ResourceCardProps) {
  // Helper to extract domain for "by [Author]" look
  const getDomain = (link: string) => {
    try {
      const hostname = new URL(link).hostname;
      return hostname.replace("www.", "");
    } catch {
      return "Unknown";
    }
  };

  const domain = getDomain(url);
  const mainTag = tags.length > 0 ? tags[0].name : "Resources";

  // Deterministic gradient based on title (fallback)
  const gradients = [
    "from-pink-500/20 to-violet-600/20 text-pink-200",
    "from-blue-500/20 to-cyan-400/20 text-blue-200",
    "from-emerald-500/20 to-teal-400/20 text-emerald-200",
    "from-orange-500/20 to-amber-400/20 text-orange-200",
    "from-indigo-500/20 to-purple-500/20 text-indigo-200",
    "from-rose-500/20 to-red-400/20 text-rose-200",
  ];

  const gradientIndex =
    title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    gradients.length;
  const selectedGradient = gradients[gradientIndex];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-4 w-full"
    >
      {/* Image Section */}
      <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-[#1A1A1A] border border-white/5 group-hover:shadow-2xl group-hover:shadow-black/50 transition-all duration-500">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-linear-to-br ${selectedGradient}`}
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <span className="text-5xl font-serif italic font-medium opacity-50 select-none">
              {title.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-white/2 transition-colors duration-300" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-white leading-snug group-hover:text-yellow-100 transition-colors line-clamp-1">
            {title}
          </h3>
          {/* Optional Badge placeholder if we had pricing/status */}
          {/* <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-lime-400 text-black uppercase tracking-wider">
            Free
          </span> */}
        </div>

        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
          {description}
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500">by</span>
          <span className="text-zinc-300 font-medium hover:text-white transition-colors">
            {domain}
          </span>
          <span className="text-zinc-500">in</span>
          <span className="text-zinc-300 font-medium hover:text-white transition-colors">
            {mainTag}
          </span>
        </div>
      </div>
    </a>
  );
}
