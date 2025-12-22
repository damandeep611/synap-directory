import PageHeader from "@/components/PageHeader";
import { db } from "@/db/drizzle";
import { bookmarks, appsAndTools, articles, markdownPosts, categories, tags, bookmarkTags } from "@/db/schema/content";
import { eq, sql, desc } from "drizzle-orm";
import ResourceFeed from "@/components/ResourceFeed";
import { notFound } from "next/navigation";

interface SidebarSectionPageProps {
  categorySlug: string;
}

export default async function SidebarSectionPage({
  categorySlug,
}: SidebarSectionPageProps) {
  
  // 1. Get Category Details
  const category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
      with: {
          section: true
      }
  });

  if (!category) {
      return notFound();
  }

  // 2. Fetch resources with their tags
  const resources = await db
    .select({
      id: bookmarks.id,
      // We don't have sidebarOption anymore on bookmarks, we filter by categoryId
      categorySlug: categories.slug,
      categoryId: categories.id,

      title: sql<string>`COALESCE(${appsAndTools.toolName}, ${articles.title}, ${markdownPosts.title})`,
      description: sql<string>`COALESCE(${appsAndTools.description}, ${articles.description}, ${markdownPosts.description})`,

      url: sql<string>`COALESCE(${appsAndTools.url}, ${articles.url}, '')`,
      imageUrl: sql<string>`COALESCE(${appsAndTools.imageUrl}, ${articles.imageUrl}, '')`,
      content: markdownPosts.content,

      createdAt: bookmarks.createdAt,

      tags: sql<{ id: string; name: string; slug: string }[]>`COALESCE(
        json_agg(
          json_build_object('id', ${tags.id}, 'name', ${tags.name}, 'slug', ${tags.slug})
        ) FILTER (WHERE ${tags.id} IS NOT NULL), 
        '[]'
      )`,
    })
    .from(bookmarks)
    .innerJoin(categories, eq(bookmarks.categoryId, categories.id))
    .leftJoin(appsAndTools, eq(bookmarks.id, appsAndTools.bookmarkId))
    .leftJoin(articles, eq(bookmarks.id, articles.bookmarkId))
    .leftJoin(markdownPosts, eq(bookmarks.id, markdownPosts.bookmarkId))
    .leftJoin(bookmarkTags, eq(bookmarks.id, bookmarkTags.bookmarkId))
    .leftJoin(tags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(categories.id, category.id)) // Filter by Category ID
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

  // 3. Fetch tags scoped to this category
  const availableTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(tags)
    .where(eq(tags.categoryId, category.id));

  return (
    <div className="min-h-full bg-black text-white">
      <PageHeader
        title={category.name}
        subtitle={`Explore the best ${category.name} resources`}
        category={category.section?.title || "Directory"}
      />

      <div className="px-6 pb-12 pt-4">
        {resources.length === 0 ? (
          <div className="p-12 border border-white/10 rounded-2xl bg-white/5 text-center">
            <h3 className="text-xl font-medium text-white mb-2">
              No Resources Yet
            </h3>
            <p className="text-white/40 max-w-sm mx-auto">
              This category is waiting for its first submission.
            </p>
          </div>
        ) : (
          <ResourceFeed
            resources={resources.map((r) => ({
              ...r,
              url: r.url || "",
              imageUrl: r.imageUrl || null,
              type: r.categorySlug, // Mapping slug to type for compatibility if needed
            }))}
            availableTags={availableTags}
          />
        )}
      </div>
    </div>
  );
}