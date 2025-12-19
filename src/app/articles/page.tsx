import PageHeader from "@/components/PageHeader";
import { db } from "@/db/drizzle";
import { articles, bookmarks } from "@/db/schema/content";
import { desc, eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

export default async function ArticlesPage() {
  const allArticles = await db.select({
    id: articles.id,
    title: articles.title,
    description: articles.description,
    url: articles.url,
    imageUrl: articles.imageUrl,
    createdAt: bookmarks.createdAt,
  })
  .from(articles)
  .innerJoin(bookmarks, eq(articles.bookmarkId, bookmarks.id))
  .orderBy(desc(bookmarks.createdAt));

  return (
    <div className="min-h-full bg-black text-white">
      <PageHeader 
        title="Articles" 
        subtitle="In-depth analysis, tutorials, and insights into the world of synthetic intelligence."
        category="Library"
      />
      
      <div className="px-8 md:px-12 py-12">
         {allArticles.length === 0 ? (
           <div className="text-white/40 text-sm">No articles found in the registry.</div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allArticles.map((article) => (
                <a 
                  key={article.id} 
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex flex-col h-full"
                >
                    <div className="w-full h-40 bg-black/50 rounded-lg mb-4 overflow-hidden relative border border-white/5">
                      {article.imageUrl ? (
                        <Image 
                          src={article.imageUrl} 
                          alt={article.title} 
                          fill 
                          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                           <ExternalLink className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] uppercase tracking-wider text-yellow-200/60">Article</span>
                       <span className="text-[9px] text-white/20">•</span>
                       <span className="text-[9px] text-white/20">
                         {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                    </div>
                    <h3 className="text-base font-medium mb-1.5 group-hover:text-yellow-200 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-3 mb-4 flex-grow">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium mt-auto pt-4 border-t border-white/5 group-hover:text-white/60 transition-colors">
                      Read Source <ExternalLink className="w-3 h-3" />
                    </div>
                </a>
              ))}
           </div>
         )}
      </div>
    </div>
  );
}
