"use client";

import PageHeader from "@/components/PageHeader";

export default function Home() {
  return (
    <div className="min-h-full bg-black text-white">
      <PageHeader
        title="Boundless Intelligence"
        subtitle="Journey through the curated landscape of synthetic creativity. From cutting-edge model registries to advanced operational blueprints."
        category="The Archive"
        bgImage="/gradients/explore-bg.avif"
      />

            <div className="px-8 md:px-12 py-12 space-y-12">

              <div className="p-6 border border-white/10 rounded-2xl bg-white/5">

                  <h2 className="text-lg font-light tracking-wide mb-3">Explore Content</h2>

                  <p className="text-xs text-white/40">Welcome to SynapDirectory. Select a category from the sidebar to begin.</p>

              </div>

            </div>

      
    </div>
  );
}