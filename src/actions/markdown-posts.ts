"use server";

import { db } from "@/db/drizzle";
import { bookmarks, markdownPosts, resourceTypes, categories } from "@/db/schema/content";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";

export async function createMarkdownPost(formData: FormData) {
  try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const content = formData.get("content") as string;
      const categoryId = formData.get("categoryId") as string | null;

      if (!title || !description || !content) {
        return { success: false, error: "Title, description and content are required" };
      }

      // 1. Get or Create "Post" Resource Type
      let [resType] = await db.select().from(resourceTypes).where(eq(resourceTypes.slug, "post"));
      if (!resType) {
          const newId = randomUUID();
          await db.insert(resourceTypes).values({
              id: newId,
              name: "Post",
              slug: "post",
          });
          resType = { id: newId, name: "Post", slug: "post", createdAt: new Date() };
      }

      // 2. Create Bookmark
      const bookmarkId = randomUUID();
      await db.insert(bookmarks).values({
        id: bookmarkId,
        resourceTypeId: resType.id,
        categoryId: categoryId || null,
      });

      // 3. Create Markdown Post
      await db.insert(markdownPosts).values({
        id: randomUUID(),
        bookmarkId: bookmarkId,
        title,
        description,
        content,
      });

      revalidatePath("/admin/dashboard");
      revalidatePath("/prompts");
      
      if (categoryId) {
          const [cat] = await db.select().from(categories).where(eq(categories.id, categoryId));
          if (cat) {
              revalidatePath(`/${cat.slug}`);
          }
      }
      
      return { success: true };
  } catch (error) {
    console.error("Failed to create markdown post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getMarkdownPostById(bookmarkId: string) {
    try {
        const result = await db.query.bookmarks.findFirst({
            where: eq(bookmarks.id, bookmarkId),
            with: {
                markdownPost: true
            }
        });

        if (!result || !result.markdownPost) {
            return { success: false, error: "Post not found" };
        }

        return {
            success: true,
            data: {
                id: result.id,
                title: result.markdownPost.title,
                description: result.markdownPost.description,
                content: result.markdownPost.content,
                createdAt: result.createdAt,
            }
        };
    } catch (error) {
        console.error("Failed to get markdown post:", error);
        return { success: false, error: "Failed to fetch post" };
    }
}