"use server";

import { db } from "@/db/drizzle";
import { bookmarks, appsAndTools, articles, categories, resourceTypes, tags, bookmarkTags, markdownPosts } from "@/db/schema/content";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as cheerio from "cheerio";
import { v2 as cloudinary } from "cloudinary";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// -- Schemas --

const fetchMetadataSchema = z.object({
  url: z.string().url(),
});

const saveBookmarkSchema = z.object({
  url: z.string().url(),
  resourceTypeId: z.string().min(1),
  categoryId: z.string().min(1),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

const createTagSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
});

// -- Actions --

export async function getTags(categoryId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    const categoryTags = await db.select().from(tags).where(eq(tags.categoryId, categoryId));
    return { success: true, data: categoryTags };
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return { success: false, error: "Failed to fetch tags" };
  }
}

export async function createTag(input: z.infer<typeof createTagSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };
    
    const validated = createTagSchema.safeParse(input);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const { name, categoryId } = validated.data;
    const slug = slugify(name);

    // Check for duplicate slug in this category
    const existing = await db.select().from(tags).where(
        and(eq(tags.slug, slug), eq(tags.categoryId, categoryId))
    );
    
    if (existing.length > 0) {
       return { success: false, error: "Tag already exists in this category" };
    }

    const newTagId = randomUUID();
    await db.insert(tags).values({
      id: newTagId,
      categoryId,
      name,
      slug,
    });

    return { success: true, data: { id: newTagId, name, slug } };
  } catch (error) {
    console.error("Failed to create tag:", error);
    return { success: false, error: "Failed to create tag" };
  }
}

export async function fetchUrlMetadata(input: z.infer<typeof fetchMetadataSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    const validated = fetchMetadataSchema.safeParse(input);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const { url } = validated.data;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "max-age=0",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      }
    });
    
    if (!response.ok) {
       // Log detailed error for debugging
       console.error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
       throw new Error(`Failed to fetch URL: ${response.statusText} (${response.status})`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = ($('meta[property="og:title"]').attr('content') || $('title').text() || "Untitled").trim();
    const description = ($('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || "").trim();
    
    let rawImageUrl = 
      $('meta[property="og:image"]').attr('content') || 
      $('meta[name="twitter:image"]').attr('content') || 
      $('link[rel="icon"]').attr('href');

    let finalImageUrl = "";

    if (rawImageUrl) {
      if (!rawImageUrl.startsWith("http")) {
        try {
          const urlObj = new URL(url);
          rawImageUrl = new URL(rawImageUrl, urlObj.origin).toString();
        } catch (e) {
          console.error("Failed to resolve relative image URL", e);
        }
      }

      try {
        const uploadResponse = await cloudinary.uploader.upload(rawImageUrl, {
          folder: "synap_directory",
        });
        finalImageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        finalImageUrl = ""; 
      }
    }

    return { 
      success: true, 
      data: {
        title,
        description,
        imageUrl: finalImageUrl
      }
    };

  } catch (error) {
    console.error("Fetch metadata error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch metadata" };
  }
}

export async function saveBookmark(input: z.infer<typeof saveBookmarkSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    const validated = saveBookmarkSchema.safeParse(input);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const { url, resourceTypeId, categoryId, title, description, imageUrl, tagIds } = validated.data;

    // Get Resource Type details to know which table to insert into
    const [resType] = await db.select().from(resourceTypes).where(eq(resourceTypes.id, resourceTypeId));
    if (!resType) return { success: false, error: "Invalid resource type" };

    const bookmarkId = randomUUID();
    
    // Insert into bookmarks with correct column names (matching schema camelCase)
    await db.insert(bookmarks).values({
      id: bookmarkId,
      resourceTypeId: resourceTypeId,
      categoryId: categoryId,
    });

    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await db.insert(bookmarkTags).values({
          bookmarkId: bookmarkId,
          tagId: tagId,
        }).onConflictDoNothing();
      }
    }

    // Determine extension table based on Resource Type slug
    if (resType.slug === "article" || resType.slug === "articles") {
         await db.insert(articles).values({
          id: randomUUID(),
          bookmarkId: bookmarkId,
          url: url,
          title: title,
          description: description,
          imageUrl: imageUrl,
        });
    } else {
        // Default to appsAndTools for "Link", "Tool", etc.
        await db.insert(appsAndTools).values({
          id: randomUUID(),
          bookmarkId: bookmarkId,
          url: url,
          toolName: title,
          description: description,
          imageUrl: imageUrl,
        });
    }

    revalidatePath("/admin/dashboard");
    
    const [cat] = await db.select().from(categories).where(eq(categories.id, categoryId));
    if (cat) {
        revalidatePath(`/${cat.slug}`);
    }

    return { success: true };

  } catch (error) {
    console.error("Save bookmark error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save bookmark" };
  }
}

export async function getAllBookmarks() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    const result = await db.query.bookmarks.findMany({
      with: {
        appsAndTool: true,
        article: true,
        markdownPost: true,
        category: true,
        resourceType: true,
      },
      orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
    });

    const flattened = result.map((b) => {
      let title = "Untitled";
      let url = "";
      
      if (b.appsAndTool) {
        title = b.appsAndTool.toolName;
        url = b.appsAndTool.url;
      } else if (b.article) {
        title = b.article.title;
        url = b.article.url;
      } else if (b.markdownPost) {
        title = b.markdownPost.title;
        url = `/md/${b.id}`;
      }

      return {
        id: b.id,
        title,
        url,
        categoryName: b.category?.name || "Uncategorized",
        resourceType: b.resourceType?.name || "Unknown",
        createdAt: b.createdAt,
      };
    });

    return { success: true, data: flattened };
  } catch (error) {
    console.error("Get all bookmarks error:", error);
    return { success: false, error: "Failed to fetch bookmarks" };
  }
}

export async function deleteBookmark(bookmarkId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    const bookmark = await db.query.bookmarks.findFirst({
        where: eq(bookmarks.id, bookmarkId),
        with: { category: true }
    });

    if (!bookmark) return { success: false, error: "Bookmark not found" };

    await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));
    
    revalidatePath("/admin/dashboard");
    if (bookmark.category) {
        revalidatePath(`/${bookmark.category.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return { success: false, error: "Failed to delete bookmark" };
  }
}