import SidebarSectionPage from "@/components/SidebarSectionPage";

export default async function DynamicCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SidebarSectionPage categorySlug={slug} />;
}
