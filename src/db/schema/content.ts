import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Categories Table
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Base Bookmarks Table
export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
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

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const bookmarksRelations = relations(bookmarks, ({ one, many }) => ({
  category: one(categories, {
    fields: [bookmarks.categoryId],
    references: [categories.id],
  }),
  // We can't easily do polymorphic relations in Drizzle yet in a single field,
  // but we can define the inverse relations in the specific tables.
  appsAndTool: one(appsAndTools),
  article: one(articles),
  markdownPost: one(markdownPosts),
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
