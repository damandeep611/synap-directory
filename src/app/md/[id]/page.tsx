import PageHeader from "@/components/PageHeader";
import { db } from "@/db/drizzle";
import { markdownPosts } from "@/db/schema/content";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function MarkdownPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await db.query.markdownPosts.findFirst({
    where: eq(markdownPosts.id, id),
    with: {
      bookmark: true,
    }
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-full bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/md" className="inline-flex items-center text-sm text-white/40 hover:text-yellow-400 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-300 text-xs font-mono uppercase tracking-widest border border-yellow-400/20">
              Markdown Resource
            </span>
            <span className="text-white/30 text-xs font-mono flex items-center gap-2">
              <Calendar className="w-3 h-3" />
               {post.bookmark.createdAt ? new Date(post.bookmark.createdAt).toLocaleDateString() : 'Recent'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-white/60 font-light leading-relaxed border-l-2 border-white/10 pl-6">
            {post.description}
          </p>
        </header>

        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:italic prose-a:text-yellow-400 hover:prose-a:text-yellow-300 prose-blockquote:border-yellow-400/50">
          <div className="whitespace-pre-wrap font-mono text-sm bg-white/5 p-6 rounded-xl border border-white/10 overflow-x-auto">
            {post.content}
          </div>
          <p className="text-xs text-white/30 mt-4 italic">
            * Rendered as raw text for safety. In a full implementation, use a markdown parser.
          </p>
        </article>
      </div>
    </div>
  );
}
