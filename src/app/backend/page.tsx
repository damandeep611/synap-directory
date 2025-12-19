import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="backend" 
      title="Backend Tools" 
      subtitle="Infrastructure, databases, and server-side utilities." 
    />
  );
}