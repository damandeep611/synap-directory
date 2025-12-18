"use client";

import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="min-h-full bg-black text-white">
      <PageHeader 
        title="GITHUB" 
        subtitle="This section is currently under development. Check back soon for curated resources." 
        category="Directory" 
      />
      <div className="px-12 md:px-20 py-16">
        <div className="p-8 border border-white/10 rounded-2xl bg-white/5">
            <p className="text-white/40">Content for GITHUB coming soon.</p>
        </div>
      </div>
    </div>
  );
}
