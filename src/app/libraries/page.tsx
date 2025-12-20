import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="libraries" 
      title="LIBRARIES" 
      subtitle="Essential code libraries, packages, and SDKs for development." 
    />
  );
}
