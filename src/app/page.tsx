import React from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import MarkdownCard from "@/components/MarkdownCard";
import CategoryTabs from "@/components/CategoryTabs";
import { getExplorePageData, getCategories } from "@/actions/sidebar";

export default async function Home() {
  const { success, data } = await getExplorePageData();
  const catResult = await getCategories();
  const sections = success && data ? data : [];
  const allCategories = catResult.success && catResult.data ? catResult.data : [];

  return (
    <div className="min-h-full bg-black text-white">
      {/* Top Category Tabs */}
      <CategoryTabs
        categories={allCategories.map((c) => ({ name: c.name, slug: c.slug }))}
        compact
      />

      {/* Content Feed */}
      <div className="px-6 py-8 space-y-16 pb-32">
        {sections.map((section) => (
          <div key={section.id} className="space-y-10">
            {/* Section Title */}
            <div className="flex items-center gap-4">
              <div className="h-px bg-white/[0.06] flex-1" />
              <h2 className="text-[11px] font-medium tracking-[0.15em] text-zinc-600 uppercase">
                {section.title}
              </h2>
              <div className="h-px bg-white/[0.06] flex-1" />
            </div>

            <div className="space-y-14">
              {section.categories.map((category) => (
                <div key={category.id} className="space-y-5">
                  {/* Category Header */}
                  <div className="flex items-end justify-between">
                    <Link
                      href={`/${category.slug}`}
                      className="group flex items-center gap-2"
                    >
                      <h3 className="text-xl font-semibold text-white group-hover:text-zinc-300 transition-colors">
                        {category.name}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-zinc-600 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>

                    {category.items.length > 0 && (
                      <Link
                        href={`/${category.slug}`}
                        className="text-[11px] font-medium uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1.5"
                      >
                        See All <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {/* Items Grid */}
                  {category.items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {category.items.map((item) => {
                        if (item.type === "markdown" && item.content) {
                          return (
                            <MarkdownCard
                              key={item.id}
                              post={{
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                content: item.content,
                                createdAt: item.date,
                              }}
                            />
                          );
                        }
                        return (
                          <ResourceCard
                            key={item.id}
                            title={item.title}
                            description={item.description}
                            url={item.url}
                            imageUrl={item.imageUrl}
                            date={item.date}
                            tags={[
                              {
                                id: "cat",
                                name: category.name,
                                slug: category.slug,
                              },
                            ]}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full h-28 rounded-xl border border-dashed border-white/[0.06] flex flex-col items-center justify-center text-zinc-700 bg-white/[0.01]">
                      <Layers className="w-5 h-5 mb-2 opacity-40" />
                      <span className="text-[11px] font-medium uppercase tracking-wider">
                        No resources yet
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">No content structure found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
