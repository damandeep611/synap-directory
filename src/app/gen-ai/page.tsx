import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <SidebarSectionPage 
      slug="gen-ai" 
      title="Gen AI Tools" 
      subtitle="The latest generation of artificial intelligence tools and frameworks." 
    />
  );
}