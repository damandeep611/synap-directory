import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="youtube" 
      title="YouTube Resources" 
      subtitle="Curated collection of high-quality YouTube channels and videos for developers." 
    />
  );
}