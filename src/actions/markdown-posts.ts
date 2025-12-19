"use server";

import { db } from "@/db/drizzle";
import { bookmarks, markdownPosts, categories } from "@/db/schema/content";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createMarkdownPost(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const sidebarOption = formData.get("sidebarOption") as string;

  if (!title || !description || !content) {
    return { error: "All fields are required" };
  }

  try {
    // 1. Get the 'md' category
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, "md"),
    });

    if (!category) {
      return { error: "Category 'md' not found" };
    }

    // 2. Create Bookmark
    const bookmarkId = crypto.randomUUID();
    await db.insert(bookmarks).values({
      id: bookmarkId,
      categoryId: category.id,
      sidebarOption: sidebarOption || null,
    });

    // 3. Create Markdown Post
    await db.insert(markdownPosts).values({
      id: crypto.randomUUID(),
      bookmarkId: bookmarkId,
      title,
      description,
      content,
    });

    revalidatePath("/md");
    if (sidebarOption) {
      revalidatePath(`/${sidebarOption}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create markdown post:", error);
    return { error: "Failed to create post" };
  }
}
