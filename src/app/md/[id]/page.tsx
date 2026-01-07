import React from 'react';
import { notFound } from 'next/navigation';
import { getMarkdownPostById } from '@/actions/markdown-posts';
import MarkdownCard from '@/components/MarkdownCard';
import ExploreHeader from '@/components/ExploreHeader';

export default async function MarkdownPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { success, data } = await getMarkdownPostById(id);

  if (!success || !data) {
    notFound();
  }

  return (
    <div className="min-h-full bg-black text-white">
      <ExploreHeader
        title="Neural Codex"
        subtitle="System entry log."
        category="Prompt Base"
        bgImage="/gradients/explore-bg.avif"
      />
      
      <div className="px-6 md:px-12 py-12 flex justify-center pb-32">
        <div className="w-full max-w-2xl">
            <MarkdownCard post={data} />
        </div>
      </div>
    </div>
  );
}
