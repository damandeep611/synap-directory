CREATE TABLE "markdown_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"bookmark_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "youtube_resources" (
	"id" text PRIMARY KEY NOT NULL,
	"bookmark_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"type" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD COLUMN "sidebar_option" text;--> statement-breakpoint
ALTER TABLE "markdown_posts" ADD CONSTRAINT "markdown_posts_bookmark_id_bookmarks_id_fk" FOREIGN KEY ("bookmark_id") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "youtube_resources" ADD CONSTRAINT "youtube_resources_bookmark_id_bookmarks_id_fk" FOREIGN KEY ("bookmark_id") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;