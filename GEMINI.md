# Project Context: SynapDirectory

## Overview
SynapDirectory is a curated resource directory and knowledge base ("Neural Codex"). It aggregates developer tools, articles, and markdown-based posts into a structured, sidebar-navigated interface. The app features a high-impact, dark-themed UI with "hero" sections and a card-based layout for resources.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Package Manager**: Bun 
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth (Email/Password, Admin roles)
- **Styling**: Tailwind CSS v4, Framer Motion
- **Icons**: Lucide React
- **UI Components**: Custom components (ResourceCard, ExploreHeader) with semantic theme classes.

## Architecture & Core Logic

### Data Model (`src/db/schema`)
The content is structured hierarchically:
1.  **Sidebar Sections** (`sidebarSections`): Top-level groupings (e.g., "Discover", "System Core").
2.  **Categories** (`categories`): Items within sections (e.g., "Web3", "AI").
3.  **Bookmarks** (`bookmarks`): The core content unit. Each bookmark belongs to a category and a `resourceType`.
4.  **Content Extensions**: Bookmarks are polymorphic and link 1:1 to specific content tables:
    - `appsAndTools`: External tools with URLs/images.
    - `articles`: External articles.
    - `markdownPosts`: Internal rich-text content.

### Key Workflows
- **Navigation**: The `Sidebar` component fetches `sidebarSections` and `categories` via `getSidebarData` (Server Action).
- **Explore Page**: The homepage (`/`) renders a "Feed" of all sections and categories, showing a preview (limit 4) of recent items per category (`getExplorePageData`).
- **Dynamic Routing**: `src/app/[slug]/page.tsx` handles individual category pages, displaying full lists of resources.
- **Admin**: `src/app/admin` (and `dashboard`) provides interfaces for managing content (protected by role checks).

### Theme & Design
- **Dark Mode**: Default aesthetic (`bg-black text-white`).
- **Typography**: Inter (Sans) and Roboto (primary). Serif fonts used for accents.
- **Visuals**: "Ken Burns" effect headers, gradient meshes (`ExploreHeader`), and consistent card designs (`ResourceCard`).

## Important Files
- `src/actions/sidebar.ts`: Core data fetching logic for navigation and explore feed.
- `src/db/schema/content.ts`: Defines the resource/category structure.
- `src/components/ResourceCard.tsx`: Unified card component for displaying tools, articles, etc.