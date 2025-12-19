import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="github" 
      title="Github Repos" 
      subtitle="Essential open-source repositories and libraries." 
    />
  );
}