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
  // Deterministic gradient based on title (fallback)
  const gradients = [
    "from-zinc-800 to-zinc-900",
    "from-zinc-800 via-zinc-900 to-neutral-900",
    "from-neutral-800 to-zinc-900",
    "from-stone-800 to-zinc-900",
    "from-zinc-800 to-stone-900",
    "from-neutral-800 via-zinc-900 to-stone-900",
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
      className="group flex flex-col w-full"
    >
      {/* Image Section */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1a1a1a] group-hover:ring-1 group-hover:ring-white/10 transition-all duration-300">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${selectedGradient}`}
          >
            <span className="text-4xl font-bold text-white/20 select-none tracking-tight">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-1 pt-3 px-0.5">
        <h3 className="text-[15px] font-semibold text-white leading-snug group-hover:text-zinc-300 transition-colors line-clamp-1">
          {title}
        </h3>

        <p className="text-[13px] text-zinc-500 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </a>
  );
}
