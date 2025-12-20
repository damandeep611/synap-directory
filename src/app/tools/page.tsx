import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="tools" 
      title="TOOLS" 
      subtitle="Useful software, utilities, and applications to boost productivity." 
    />
  );
}
