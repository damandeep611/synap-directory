"use server";

import { db } from "@/db/drizzle";
import { bookmarks, appsAndTools, articles, categories, markdownPosts } from "@/db/schema/content";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as cheerio from "cheerio";
import { v2 as cloudinary } from "cloudinary";
import { eq } from "drizzle-orm";

import { randomUUID } from "crypto";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -- Configuration --
const SUPPORTED_CATEGORIES = [
  { name: "Apps & Tools", slug: "apps-and-tools" },
  { name: "Articles", slug: "articles" },
  { name: "YouTube", slug: "youtube" },
];

// -- Schemas --

const fetchMetadataSchema = z.object({
  url: z.string().url(),
});

const saveBookmarkSchema = z.object({
  url: z.string().url(),
  categoryId: z.string().min(1),
  sidebarOption: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

// -- Actions --

export async function getCategories() {
  try {
    for (const cat of SUPPORTED_CATEGORIES) {
      await db.insert(categories)
        .values({
          id: randomUUID(),
          name: cat.name,
          slug: cat.slug,
        })
        .onConflictDoNothing({ target: categories.slug });
    }
    const allCategories = await db.select().from(categories);
    return { success: true, data: allCategories };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function fetchUrlMetadata(input: z.infer<typeof fetchMetadataSchema>) {
  try {
    // 1. Auth Check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    // 2. Validate Input
    const validated = fetchMetadataSchema.safeParse(input);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const { url } = validated.data;

    // 3. Fetch HTML with custom User-Agent
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
      }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch URL: ${response.statusText}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // 3. Parse Metadata
    const title = ($('meta[property="og:title"]').attr('content') || $('title').text() || "Untitled").trim();
    const description = ($('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || "").trim();
    
    let rawImageUrl = 
      $('meta[property="og:image"]').attr('content') || 
      $('meta[name="twitter:image"]').attr('content') || 
      $('link[rel="icon"]').attr('href');

    let finalImageUrl = "";

    // 4. Handle Image Upload (Immediate)
    if (rawImageUrl) {
      // Resolve relative URLs
      if (!rawImageUrl.startsWith("http")) {
        try {
          const urlObj = new URL(url);
          rawImageUrl = new URL(rawImageUrl, urlObj.origin).toString();
        } catch (e) {
          console.error("Failed to resolve relative image URL", e);
        }
      }

      // Upload to Cloudinary
      try {
        const uploadResponse = await cloudinary.uploader.upload(rawImageUrl, {
          folder: "synap_directory",
        });
        finalImageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        // Fallback: use the raw URL if upload fails, or leave empty
        finalImageUrl = rawImageUrl.startsWith("http") ? rawImageUrl : ""; 
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
    // 1. Auth Check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    // 2. Validate Input
    const validated = saveBookmarkSchema.safeParse(input);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const { url, categoryId, sidebarOption, title, description, imageUrl } = validated.data;

    // 3. Get Category
    const [category] = await db.select().from(categories).where(eq(categories.id, categoryId));
    if (!category) return { success: false, error: "Invalid category selection" };

    // 4. Sequential Inserts (neon-http doesn't support transactions)
    const bookmarkId = randomUUID();
    
    await db.insert(bookmarks).values({
      id: bookmarkId,
      categoryId: categoryId,
      sidebarOption: sidebarOption,
    });

    switch (category.slug) {
      case "apps-and-tools":
        await db.insert(appsAndTools).values({
          id: randomUUID(),
          bookmarkId: bookmarkId,
          url: url,
          toolName: title,
          description: description,
          imageUrl: imageUrl,
        });
        break;
      case "articles":
        await db.insert(articles).values({
          id: randomUUID(),
          bookmarkId: bookmarkId,
          url: url,
          title: title,
          description: description,
          imageUrl: imageUrl,
        });
        revalidatePath("/articles");
        break;
      case "youtube":
        // YouTube items are now stored in appsAndTools (or similar),
        // we distinguish them by sidebarOption or inference in the UI.
        // Using appsAndTools as a generic resource holder.
        await db.insert(appsAndTools).values({
          id: randomUUID(),
          bookmarkId: bookmarkId,
          url: url,
          toolName: title, // Map title to toolName
          description: description,
          imageUrl: imageUrl,
        });
        revalidatePath("/youtube");
        break;
      default:
        throw new Error(`No handler for category type: ${category.slug}`);
    }

    if (sidebarOption) {
      revalidatePath(`/${sidebarOption}`);
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
        url = `/md/${b.id}`; // Construct internal URL for MD posts
      }

      return {
        id: b.id,
        title,
        url,
        type: b.category.name,
        createdAt: b.createdAt,
        sidebarOption: b.sidebarOption,
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

    // Fetch first to know what to revalidate
    const bookmark = await db.query.bookmarks.findFirst({
      where: eq(bookmarks.id, bookmarkId),
    });

    if (!bookmark) return { success: false, error: "Bookmark not found" };

    await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));

    if (bookmark.sidebarOption) {
      revalidatePath(`/${bookmark.sidebarOption}`);
    }
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return { success: false, error: "Failed to delete bookmark" };
  }
}

