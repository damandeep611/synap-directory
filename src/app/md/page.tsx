import PageHeader from "@/components/PageHeader";
import { db } from "@/db/drizzle";
import { bookmarks, markdownPosts, categories } from "@/db/schema/content";
import { eq, desc } from "drizzle-orm";
import { FileText } from "lucide-react";
import MarkdownCard from "@/components/MarkdownCard";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const posts = await db
    .select({
      id: markdownPosts.id,
      title: markdownPosts.title,
      description: markdownPosts.description,
      content: markdownPosts.content,
      createdAt: bookmarks.createdAt,
    })
    .from(markdownPosts)
    .innerJoin(bookmarks, eq(markdownPosts.bookmarkId, bookmarks.id))
    .innerJoin(categories, eq(bookmarks.categoryId, categories.id))
    .where(eq(categories.slug, "md"))
    .orderBy(desc(bookmarks.createdAt));

  return (
    <div className="min-h-full bg-black text-white">
      <PageHeader 
        title="Markdown Resources" 
        subtitle="Community submitted markdown guides, documentation, and thoughts." 
        category="Directory" 
      />
      
      <div className="px-8 md:px-12 lg:px-20 py-12">
        {posts.length === 0 ? (
           <div className="p-12 border border-white/10 rounded-2xl bg-white/5 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 text-white/20 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Posts Yet</h3>
            <p className="text-white/40 max-w-sm mx-auto">
              Be the first to submit a markdown resource via the submit page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {posts.map((post) => (
              <MarkdownCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
