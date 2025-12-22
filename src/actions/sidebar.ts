"use server";

import { db } from "@/db/drizzle";
import { sidebarSections, categories, resourceTypes } from "@/db/schema/content";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomUUID } from "crypto";
import { eq, asc } from "drizzle-orm";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const createSectionSchema = z.object({
  title: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

const createCategorySchema = z.object({
  name: z.string().min(1),
  sectionId: z.string().min(1),
  iconUrl: z.string().optional(),
});

// --- Resource Types Actions ---
export async function getResourceTypes() {
    try {
        // Ensure default types exist
        const defaults = ["Link", "Article", "Tool", "Post"]; 
        for (const name of defaults) {
            await db.insert(resourceTypes).values({
                id: randomUUID(),
                name,
                slug: slugify(name),
            }).onConflictDoNothing({ target: resourceTypes.slug });
        }
        
        const types = await db.select().from(resourceTypes);
        return { success: true, data: types };
    } catch (error) {
        console.error("Failed to fetch resource types:", error);
        return { success: false, error: "Failed to fetch resource types" };
    }
}


// --- Sidebar Actions ---

export async function getSidebarData() {
  try {
    const sections = await db.query.sidebarSections.findMany({
      orderBy: [asc(sidebarSections.sortOrder), asc(sidebarSections.createdAt)],
      with: {
        categories: true,
      },
    });
    return { success: true, data: sections };
  } catch (error) {
    console.error("Failed to fetch sidebar data:", error);
    return { success: false, error: "Failed to fetch sidebar data" };
  }
}

export async function getCategories() {
  try {
    const cats = await db.query.categories.findMany({
      with: {
        section: true
      },
      orderBy: [asc(categories.name)]
    });
    return { success: true, data: cats };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function createSidebarSection(input: z.infer<typeof createSectionSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    const validated = createSectionSchema.safeParse(input);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const { title, sortOrder } = validated.data;
    const slug = slugify(title);

    const newId = randomUUID();
    await db.insert(sidebarSections).values({
      id: newId,
      title,
      slug,
      sortOrder,
    });

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true, data: { id: newId } };
  } catch (error) {
    console.error("Failed to create sidebar section:", error);
    return { success: false, error: "Failed to create sidebar section" };
  }
}

export async function createCategory(input: z.infer<typeof createCategorySchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

    const validated = createCategorySchema.safeParse(input);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const { name, sectionId, iconUrl } = validated.data;
    const slug = slugify(name);

    const newId = randomUUID();
    await db.insert(categories).values({
      id: newId,
      name,
      slug,
      sectionId,
      iconUrl,
    });

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true, data: { id: newId } };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function deleteSidebarSection(id: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

        await db.delete(sidebarSections).where(eq(sidebarSections.id, id));
        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete section" };
    }
}

export async function deleteCategory(id: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") return { success: false, error: "Unauthorized" };

        await db.delete(categories).where(eq(categories.id, id));
        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete category" };
    }
}
