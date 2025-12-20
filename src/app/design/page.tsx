import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="design" 
      title="DESIGN" 
      subtitle="Curated design resources, UI kits, and inspiration for the synthetic age." 
    />
  );
}
