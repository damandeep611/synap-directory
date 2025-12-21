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
  sidebarOption: text("sidebar_option"),
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
  slug: text("slug").notNull(), // scoped to category conceptually, but unique constraint might be tricky if not careful. For now, simple text.
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
export const categoriesRelations = relations(categories, ({ many }) => ({
  bookmarks: many(bookmarks),
  tags: many(tags),
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
