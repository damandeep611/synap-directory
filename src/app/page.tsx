import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import ExploreHeader from "@/components/ExploreHeader";
import ResourceCard from "@/components/ResourceCard";
import { getExplorePageData } from "@/actions/sidebar";

export default async function Home() {
  const { success, data } = await getExplorePageData();
  const sections = success && data ? data : [];

  return (
    <div className="min-h-full bg-black text-white">
      <ExploreHeader
        title="Boundless Intelligence"
        subtitle="Journey through the curated landscape of synthetic creativity. From cutting-edge model registries to advanced operational blueprints."
        category="The Archive"
        bgImage="/gradients/explore-bg.avif"
      />

      <div className="px-6 md:px-12 py-12 space-y-20 pb-32">
        {sections.map((section) => (
          <div key={section.id} className="space-y-12">
            {/* Section Title */}
            <div className="flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1" />
              <h2 className="text-sm font-medium tracking-[0.2em] text-white/40 uppercase">
                {section.title}
              </h2>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="space-y-16">
              {section.categories.map((category) => (
                <div key={category.id} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                      <Link 
                        href={`/${category.slug}`}
                        className="group flex items-center gap-2"
                      >
                         <h3 className="text-2xl font-serif italic text-white group-hover:text-yellow-200 transition-colors">
                           {category.name}
                         </h3>
                         <ArrowRight className="w-4 h-4 text-white/20 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </Link>
                    </div>
                    
                    {category.items.length > 0 && (
                        <Link 
                            href={`/${category.slug}`}
                            className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-2"
                        >
                            See All <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                  </div>

                  {/* Items Grid */}
                  {category.items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {category.items.map((item) => (
                        <ResourceCard
                          key={item.id}
                          title={item.title}
                          description={item.description}
                          url={item.url}
                          imageUrl={item.imageUrl}
                          date={item.date}
                          tags={[{ id: 'cat', name: category.name, slug: category.slug }]} // Passing category as tag context
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 bg-white/[0.02]">
                       <Layers className="w-6 h-6 mb-2 opacity-50" />
                       <span className="text-xs font-medium uppercase tracking-wider">No resources yet</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
            <div className="text-center py-20">
                <p className="text-white/40 text-sm">No content structure found.</p>
            </div>
        )}
      </div>
    </div>
  );
}