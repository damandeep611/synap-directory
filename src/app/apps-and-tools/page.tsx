import PageHeader from "@/components/PageHeader";
import { db } from "@/db/drizzle";
import { appsAndTools, bookmarks } from "@/db/schema/content";
import { desc, eq } from "drizzle-orm";
import { ExternalLink, Wrench } from "lucide-react";
import Image from "next/image";

export default async function AppsAndToolsPage() {
  const allTools = await db.select({
    id: appsAndTools.id,
    toolName: appsAndTools.toolName,
    description: appsAndTools.description,
    url: appsAndTools.url,
    imageUrl: appsAndTools.imageUrl,
    createdAt: bookmarks.createdAt,
  })
  .from(appsAndTools)
  .innerJoin(bookmarks, eq(appsAndTools.bookmarkId, bookmarks.id))
  .orderBy(desc(bookmarks.createdAt));

  return (
    <div className="min-h-full bg-black text-white">
      <PageHeader 
        title="APPS AND TOOLS" 
        subtitle="Curated collection of essential tools, frameworks, and applications for the synthetic age." 
        category="Directory" 
      />
      <div className="px-8 md:px-12 py-12">
        {allTools.length === 0 ? (
           <div className="text-white/40 text-sm">No apps or tools found in the registry.</div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTools.map((tool) => (
                <a 
                  key={tool.id} 
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex flex-col h-full"
                >
                    <div className="w-full h-40 bg-black/50 rounded-lg mb-4 overflow-hidden relative border border-white/5">
                      {tool.imageUrl ? (
                        <Image 
                          src={tool.imageUrl} 
                          alt={tool.toolName} 
                          fill 
                          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                           <Wrench className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] uppercase tracking-wider text-blue-300/60">Tool</span>
                       <span className="text-[9px] text-white/20">•</span>
                       <span className="text-[9px] text-white/20">
                         {new Date(tool.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                    </div>
                    <h3 className="text-base font-medium mb-1.5 group-hover:text-blue-300 transition-colors line-clamp-2">
                      {tool.toolName}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-3 mb-4 flex-grow">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium mt-auto pt-4 border-t border-white/5 group-hover:text-white/60 transition-colors">
                      Launch Tool <ExternalLink className="w-3 h-3" />
                    </div>
                </a>
              ))}
           </div>
         )}
      </div>
    </div>
  );
}
