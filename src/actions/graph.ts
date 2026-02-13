"use server";

import { db } from "@/db/drizzle";
import { GRAPH_CONFIG } from "@/utils/graph-config";

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  color: string;
  size: number;
  val: number; // For force graph sizing
  slug?: string;
  url?: string;
  isClickable?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  color?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export async function getGraphData(): Promise<GraphData> {
  const sections = await db.query.sidebarSections.findMany({
    with: {
      categories: {
        with: {
          bookmarks: {
            with: {
              appsAndTool: true,
              article: true,
              markdownPost: true,
              tags: {
                with: {
                  tag: true
                }
              }
            }
          }
        }
      }
    }
  });

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const tagNodesMap = new Map<string, boolean>();

  // 1. Root Node
  const rootId = "root";
  nodes.push({
    id: rootId,
    label: "Neural Codex",
    type: "root",
    color: GRAPH_CONFIG.root.color,
    size: GRAPH_CONFIG.root.size,
    val: GRAPH_CONFIG.root.size * 5,
    isClickable: false,
  });

  sections.forEach((section) => {
    // 2. Section Nodes (Not clickable)
    nodes.push({
      id: section.id,
      label: section.title.toUpperCase(),
      type: "section",
      color: GRAPH_CONFIG.section.color,
      size: GRAPH_CONFIG.section.size,
      val: GRAPH_CONFIG.section.size * 3,
      isClickable: false,
    });

    links.push({ 
      source: rootId, 
      target: section.id,
      color: "#10b981" // Vibrant Emerald Green
    });

    section.categories.forEach((category) => {
      // 3. Category Nodes (Clickable)
      nodes.push({
        id: category.id,
        label: category.name,
        type: "category",
        color: GRAPH_CONFIG.category.color,
        size: GRAPH_CONFIG.category.size,
        val: GRAPH_CONFIG.category.size * 2,
        slug: `/${category.slug}`,
        isClickable: true,
      });

      links.push({ 
        source: section.id, 
        target: category.id,
        color: GRAPH_CONFIG.category.color 
      });

      category.bookmarks.forEach((bookmark) => {
        let label = "Unknown Resource";
        let url = undefined;
        let slug = undefined;

        if (bookmark.appsAndTool) {
          label = bookmark.appsAndTool.toolName;
          url = bookmark.appsAndTool.url;
        } else if (bookmark.article) {
          label = bookmark.article.title;
          url = bookmark.article.url;
        } else if (bookmark.markdownPost) {
          label = bookmark.markdownPost.title;
          slug = `/md/${bookmark.markdownPost.id}`;
        }

        // 4. Bookmark Nodes (Clickable)
        nodes.push({
          id: bookmark.id,
          label: label,
          type: "bookmark",
          color: GRAPH_CONFIG.bookmark.color,
          size: GRAPH_CONFIG.bookmark.size,
          val: GRAPH_CONFIG.bookmark.size,
          url: url,
          slug: slug,
          isClickable: true,
        });

        links.push({ 
          source: category.id, 
          target: bookmark.id,
          color: GRAPH_CONFIG.category.color 
        });

        // 5. Tag Nodes & Cross-links
        bookmark.tags.forEach(({ tag }) => {
          if (!tagNodesMap.has(tag.id)) {
            nodes.push({
              id: tag.id,
              label: `#${tag.name.toLowerCase()}`,
              type: "tag",
              color: GRAPH_CONFIG.tag.color,
              size: GRAPH_CONFIG.tag.size,
              val: GRAPH_CONFIG.tag.size * 0.5,
              isClickable: false,
            });
            tagNodesMap.set(tag.id, true);
          }
          
          links.push({ 
            source: bookmark.id, 
            target: tag.id,
            color: GRAPH_CONFIG.tag.color 
          });
        });
      });
    });
  });

  return { nodes, links };
}
