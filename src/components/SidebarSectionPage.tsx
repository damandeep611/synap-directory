import PageHeader from "@/components/PageHeader";
import { db } from "@/db/drizzle";
import { bookmarks, appsAndTools, articles, markdownPosts, categories, tags, bookmarkTags } from "@/db/schema/content";
import { eq, sql, desc, inArray } from "drizzle-orm";
import ResourceFeed from "@/components/ResourceFeed";

interface SidebarSectionPageProps {
  slug: string;
  title: string;
  subtitle: string;
}

export default async function SidebarSectionPage({ slug, title, subtitle }: SidebarSectionPageProps) {
  // 1. Fetch resources with their tags
  // We use sql.raw or sql templates for json aggregation in Postgres
  const resources = await db
    .select({
      id: bookmarks.id,
      sidebarOption: bookmarks.sidebarOption,
      categorySlug: categories.slug,
      categoryId: categories.id,
      
      title: sql<string>`COALESCE(${appsAndTools.toolName}, ${articles.title}, ${markdownPosts.title})`,
      description: sql<string>`COALESCE(${appsAndTools.description}, ${articles.description}, ${markdownPosts.description})`,
      
      url: sql<string>`COALESCE(${appsAndTools.url}, ${articles.url}, '')`,
      imageUrl: sql<string>`COALESCE(${appsAndTools.imageUrl}, ${articles.imageUrl}, '')`,
      content: markdownPosts.content,
      
      createdAt: bookmarks.createdAt,
      
      // Aggregate tags into a JSON array
      tags: sql<{id: string, name: string, slug: string}[]>`COALESCE(
        json_agg(
          json_build_object('id', ${tags.id}, 'name', ${tags.name}, 'slug', ${tags.slug})
        ) FILTER (WHERE ${tags.id} IS NOT NULL), 
        '[]'
      )`
    })
    .from(bookmarks)
    .innerJoin(categories, eq(bookmarks.categoryId, categories.id))
    .leftJoin(appsAndTools, eq(bookmarks.id, appsAndTools.bookmarkId))
    .leftJoin(articles, eq(bookmarks.id, articles.bookmarkId))
    .leftJoin(markdownPosts, eq(bookmarks.id, markdownPosts.bookmarkId))
    .leftJoin(bookmarkTags, eq(bookmarks.id, bookmarkTags.bookmarkId))
    .leftJoin(tags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(bookmarks.sidebarOption, slug))
    .groupBy(
        bookmarks.id, 
        categories.slug, 
        categories.id,
        appsAndTools.toolName, 
        appsAndTools.description, 
        appsAndTools.url, 
        appsAndTools.imageUrl,
        articles.title, 
        articles.description, 
        articles.url, 
        articles.imageUrl,
        markdownPosts.title, 
        markdownPosts.description,
        markdownPosts.content
    )
    .orderBy(desc(bookmarks.createdAt));

  // 2. Fetch all available tags for this specific category (based on the first resource found or category slug)
  // Since multiple categories could theoretically have the same sidebarOption (though unlikely in current design),
  // we fetch tags for all categories found in the resources.
  const categoryIds = Array.from(new Set(resources.map(r => r.categoryId)));
  
  let availableTags: { id: string; name: string; slug: string }[] = [];
  if (categoryIds.length > 0) {
    availableTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(tags)
      .where(inArray(tags.categoryId, categoryIds));
  }

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
          <ResourceFeed 
            resources={resources.map(r => ({
                ...r,
                url: r.url || '',
                imageUrl: r.imageUrl || null,
            }))} 
            availableTags={availableTags} 
          />
        )}
      </div>
    </div>
  );
}
