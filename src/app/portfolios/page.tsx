import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="portfolios" 
      title="PORTFOLIOS" 
      subtitle="Showcase of exceptional portfolios and creative works." 
    />
  );
}
