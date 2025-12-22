import SidebarSectionPage from "@/components/SidebarSectionPage";

export const dynamic = 'force-dynamic';

export default function ArticlesPage() {
  return (
    <SidebarSectionPage
      categorySlug="articles"
    />
  );
}