import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="workflows" 
      title="WORKFLOWS" 
      subtitle="Optimized workflows, pipelines, and automation strategies." 
    />
  );
}
