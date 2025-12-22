import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Resource Types (formerly "categories" table: Apps & Tools, Articles, etc.)
export const resourceTypes = pgTable("resource_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Sidebar Sections (Headers like "Discover", "Directory", "Tech")
export const sidebarSections = pgTable("sidebar_sections", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Categories (Items in Sidebar like "Web3", "AI", "Design")
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sectionId: text("section_id")
    .references(() => sidebarSections.id, { onDelete: "cascade" }),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  resourceTypeId: text("resource_type_id")
    .notNull()
    .references(() => resourceTypes.id),
  categoryId: text("category_id")
    .references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Extension: Apps & Tools
export const appsAndTools = pgTable("apps_and_tools", {
  id: text("id").primaryKey(),
  bookmarkId: text("bookmark_id")
    .notNull()
    .references(() => bookmarks.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  toolName: text("tool_name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

// Extension: Articles
export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  bookmarkId: text("bookmark_id")
    .notNull()
    .references(() => bookmarks.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

// Extension: Markdown Posts
export const markdownPosts = pgTable("markdown_posts", {
  id: text("id").primaryKey(),
  bookmarkId: text("bookmark_id")
    .notNull()
    .references(() => bookmarks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), 
});

// Tags Table (Scoped to Categories)
export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookmark Tags Junction Table
export const bookmarkTags = pgTable("bookmark_tags", {
  bookmarkId: text("bookmark_id")
    .notNull()
    .references(() => bookmarks.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: [t.bookmarkId, t.tagId],
}));

// Relations

export const resourceTypesRelations = relations(resourceTypes, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const sidebarSectionsRelations = relations(sidebarSections, ({ many }) => ({
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  section: one(sidebarSections, {
    fields: [categories.sectionId],
    references: [sidebarSections.id],
  }),
  bookmarks: many(bookmarks),
  tags: many(tags),
}));

export const bookmarksRelations = relations(bookmarks, ({ one, many }) => ({
  resourceType: one(resourceTypes, {
    fields: [bookmarks.resourceTypeId],
    references: [resourceTypes.id],
  }),
  category: one(categories, {
    fields: [bookmarks.categoryId],
    references: [categories.id],
  }),
  appsAndTool: one(appsAndTools),
  article: one(articles),
  markdownPost: one(markdownPosts),
  tags: many(bookmarkTags),
}));

export const appsAndToolsRelations = relations(appsAndTools, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [appsAndTools.bookmarkId],
    references: [bookmarks.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [articles.bookmarkId],
    references: [bookmarks.id],
  }),
}));

export const markdownPostsRelations = relations(markdownPosts, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [markdownPosts.bookmarkId],
    references: [bookmarks.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  category: one(categories, {
    fields: [tags.categoryId],
    references: [categories.id],
  }),
  bookmarks: many(bookmarkTags),
}));

export const bookmarkTagsRelations = relations(bookmarkTags, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [bookmarkTags.bookmarkId],
    references: [bookmarks.id],
  }),
  tag: one(tags, {
    fields: [bookmarkTags.tagId],
    references: [tags.id],
  }),
}));