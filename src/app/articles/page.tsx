import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function ArticlesPage() {
  return (
    <SidebarSectionPage
      slug="articles"
      title="Articles"
      subtitle="In-depth analysis, tutorials, and insights into the world of synthetic intelligence."
    />
  );
}

