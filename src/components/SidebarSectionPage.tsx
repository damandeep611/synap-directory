import PageHeader from "@/components/PageHeader";
import { db } from "@/db/drizzle";
import { bookmarks, appsAndTools, articles, markdownPosts, categories } from "@/db/schema/content";
import { eq, sql, desc } from "drizzle-orm";
import MarkdownCard from "@/components/MarkdownCard";
import ToolCard from "@/components/ToolCard";
import ArticleCard from "@/components/ArticleCard";

interface SidebarSectionPageProps {
  slug: string;
  title: string;
  subtitle: string;
}

// Resource Card Registry
const RESOURCE_COMPONENTS: Record<string, React.ElementType> = {
  'apps-and-tools': ToolCard,
  'articles': ArticleCard,
  'md': MarkdownCard,
};

export default async function SidebarSectionPage({ slug, title, subtitle }: SidebarSectionPageProps) {
  // We need to fetch all resources tagged with this sidebar option
  // We join all potential content tables. 
  
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
              const CardComponent = RESOURCE_COMPONENTS[res.categorySlug];

              if (!CardComponent) {
                return null; // Or a fallback component
              }

              // Normalize props for the components
              // MarkdownCard expects 'post', others expect flat props
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

              return (
                <CardComponent
                  key={res.id}
                  title={res.title}
                  description={res.description}
                  url={res.url}
                  imageUrl={res.imageUrl}
                  createdAt={res.createdAt}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
