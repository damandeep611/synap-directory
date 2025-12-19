import PageHeader from "@/components/PageHeader";
import { db } from "@/db/drizzle";
import { bookmarks, appsAndTools, articles, markdownPosts, categories } from "@/db/schema/content";
import { eq, sql, desc } from "drizzle-orm";
import MarkdownCard from "@/components/MarkdownCard";
import { ExternalLink, Wrench, BookOpen } from "lucide-react";
import Image from "next/image";

interface SidebarSectionPageProps {
  slug: string;
  title: string;
  subtitle: string;
}

export default async function SidebarSectionPage({ slug, title, subtitle }: SidebarSectionPageProps) {
  // We need to fetch all resources tagged with this sidebar option
  // We join all potential content tables. 
  // Note: In a larger app, union queries might be more performant than left joins with coalescing, 
  // but for this scale, this is clean.
  
  const resources = await db
    .select({
      id: bookmarks.id,
      sidebarOption: bookmarks.sidebarOption,
      categorySlug: categories.slug, // 'apps-and-tools', 'articles', 'md'
      
      // Coalesce fields to get the actual content regardless of table
      title: sql<string>`COALESCE(${appsAndTools.toolName}, ${articles.title}, ${markdownPosts.title})`,
      description: sql<string>`COALESCE(${appsAndTools.description}, ${articles.description}, ${markdownPosts.description})`,
      
      // Specific fields
      url: sql<string>`COALESCE(${appsAndTools.url}, ${articles.url})`,
      imageUrl: sql<string>`COALESCE(${appsAndTools.imageUrl}, ${articles.imageUrl})`,
      content: markdownPosts.content,
      
      createdAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .innerJoin(categories, eq(bookmarks.categoryId, categories.id))
    .leftJoin(appsAndTools, eq(bookmarks.id, appsAndTools.bookmarkId))
    .leftJoin(articles, eq(bookmarks.id, articles.bookmarkId))
    .leftJoin(markdownPosts, eq(bookmarks.id, markdownPosts.bookmarkId))
    .where(eq(bookmarks.sidebarOption, slug))
    .orderBy(desc(bookmarks.createdAt));

  return (
    <div className="min-h-full bg-black text-white">
      <PageHeader 
        title={title} 
        subtitle={subtitle} 
        category="Directory" 
      />
      
      <div className="px-8 md:px-12 lg:px-20 py-12">
        {resources.length === 0 ? (
           <div className="p-12 border border-white/10 rounded-2xl bg-white/5 text-center">
            <h3 className="text-xl font-medium text-white mb-2">No Resources Yet</h3>
            <p className="text-white/40 max-w-sm mx-auto">
              This section is waiting for its first submission.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {resources.map((res) => {
              // --- RENDER LOGIC ---
              
              // 1. Markdown Post
              if (res.categorySlug === 'md' && res.content) {
                 return (
                    <MarkdownCard 
                        key={res.id} 
                        post={{
                            id: res.id,
                            title: res.title,
                            description: res.description,
                            content: res.content,
                            createdAt: res.createdAt
                        }} 
                    />
                 );
              }

              // 2. Link Resource (App/Tool or Article)
              const isArticle = res.categorySlug === 'articles';
              const Icon = isArticle ? BookOpen : Wrench;
              const label = isArticle ? "Article" : "Tool";
              const hoverColor = isArticle ? "group-hover:text-purple-300" : "group-hover:text-blue-300";
              const labelColor = isArticle ? "text-purple-300/60" : "text-blue-300/60";

              return (
                <a 
                  key={res.id} 
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 border border-white/10 rounded-2xl bg-[#0A0A0A] hover:bg-white/[0.02] hover:border-white/20 transition-all duration-300 cursor-pointer group flex flex-col h-[480px] shadow-2xl relative overflow-hidden"
                >
                    <div className="w-full h-48 bg-black/50 rounded-xl mb-6 overflow-hidden relative border border-white/5">
                      {res.imageUrl ? (
                        <Image 
                          src={res.imageUrl} 
                          alt={res.title || "Resource"} 
                          fill 
                          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                           <Icon className="w-8 h-8 text-white/10" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                       <span className={`text-[10px] uppercase tracking-widest font-mono ${labelColor} border border-white/10 px-2 py-0.5 rounded`}>
                           {label}
                       </span>
                       <span className="text-[10px] text-white/20 font-mono">
                         {new Date(res.createdAt).toLocaleDateString()}
                       </span>
                    </div>

                    <h3 className={`text-xl font-serif font-bold tracking-tight mb-3 text-white ${hoverColor} transition-colors line-clamp-2`}>
                      {res.title}
                    </h3>

                    <p className="text-sm text-white/40 leading-relaxed line-clamp-3 mb-6 flex-grow font-light">
                      {res.description}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">
                      <span>Launch Resource</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
