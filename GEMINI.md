# Development System Instructions

## Core Architectural Principles


some env variable names 
DATABASE_URL =
and use these for cloudinary 
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=



### Separation of Logic from Content
- **Application Logic** (authentication states, user roles, core workflows) belongs in schema as enums and constraints
- **Content** (user-generated or admin-managed data like categories, tags, bookmarks) belongs in relational tables that can be modified through UI
- Never use database enums for content that will evolve or require frequent updates

### Single Source of Truth
- Database is the single source of truth for all data
- TypeScript types are generated/derived from database schema, never manually defined separately
- UI components query data from database, never from hardcoded arrays or objects
- Never duplicate the same data definition in multiple places (schema, types, form arrays)

### Data Normalization
- Each piece of data should exist in exactly one place
- Use foreign keys and relationships instead of duplicating data
- Avoid nullable columns - if you have many nullable fields, your table structure is wrong

### Incremental Development
- Build features in isolated modules that don't require changes to core schemas
- Each new feature should be addable without modifying existing stable code
- Start with one complete vertical slice (schema → form → display) before adding more

## Database Design Patterns

### Schema Organization
- Use separate tables for different entity types rather than single table with many nullable columns
- Base tables hold shared/common data only
- Type-specific tables extend base tables via foreign keys
- Keep base tables stable - extensions should not require base table modifications

### Foreign Key Relationships
- Always use foreign keys to maintain referential integrity
- Cascade deletes should be explicit and carefully considered
- Use junction tables for many-to-many relationships

### Soft Deletes
- Use `deleted_at` timestamp field for soft deletes
- Always filter `WHERE deleted_at IS NULL` in queries for active records

## Authentication & Authorization
-- the authentication is already done you can see the Schema files
### Two-Layer Security Model
1. **Authentication** - "Who are you?" - Verify valid session exists
2. **Authorization** - "What can you do?" - Verify user has required permissions

### Server Action Security Pattern
Every protected server action MUST follow this exact sequence:
```
1. Get session from auth provider
2. Verify session exists → if not, throw unauthorized error
3. Verify user has required role → if not, throw forbidden error
4. Validate ALL input data with Zod schema → if invalid, throw validation error
5. Sanitize inputs before database operations
6. Execute database operation within try-catch
7. Return typed success/error response
```

### Security Rules
- **Never trust client input** - Always validate and sanitize on server
- **Never expose sensitive data** - Filter response data before sending to client
- **Never skip authorization checks** - Even if UI hides buttons, server must enforce permissions
- **Always use parameterized queries** - Never concatenate user input into SQL
- **Rate limit authentication attempts** - Implement exponential backoff
- **Log security events** - Track failed auth attempts, permission denials, suspicious patterns

## Server Actions Best Practices

### Input Validation
- Define Zod schema for every server action input
- Validate before any business logic executes
- Return user-friendly error messages for validation failures
- Never proceed with invalid data

### Error Handling
- Use try-catch for all database operations
- Return structured error objects: `{ success: false, error: string }`
- Log errors server-side with context (user ID, action, timestamp)
- Never expose internal error details to client

### Response Structure
- Consistent response format: `{ success: boolean, data?: T, error?: string }`
- Always return typed responses matching expected schema
- Include only necessary data in responses

## Component Design Principles

### Dynamic Component Rendering
- Use component registries/maps instead of switch statements
- Let data drive which component renders, not hardcoded logic
- Components should be generic and reusable across similar use cases

### Props and Type Safety
- All component props must be fully typed with TypeScript
- Use discriminated unions for variant components
- Prefer explicit props over spreading generic objects

### Form Handling
- Single responsibility - forms should only handle input collection
- Validation happens server-side, forms display validation errors
- Loading and error states must be explicitly handled
- Use controlled components for form inputs

## Code Organization

### File Structure
- Group by feature/domain, not by file type
- Shared utilities in separate `/lib` or `/utils` directory

### Naming Conventions
- Database tables: plural, snake_case (e.g., `bookmark_tags`)
- TypeScript types: PascalCase (e.g., `BookmarkTag`)
- Functions/variables: camelCase (e.g., `createBookmark`)
- Server actions: verb-noun pattern (e.g., `createArticle`, `deleteBookmark`)
- Components: PascalCase (e.g., `ArticleCard`)

### Import Organization
```
1. External dependencies (react, next, etc.)
2. Internal absolute imports (@/components, @/lib)
3. Relative imports (./utils, ../types)
4. Type imports at the end
```

## State Management

### Client State
- Use React state (useState, useReducer) for UI-only state
- Use TanStack Query for server state
- Never store server data in React state if using TanStack Query

### Server State with TanStack Query
- All server data fetching through TanStack Query
- Implement proper cache invalidation on mutations
- Use optimistic updates for better UX
- Handle loading, error, and success states explicitly

### Form State
- Controlled components for inputs
- Form libraries (react-hook-form) for complex forms
- Validate on blur and submit, not on every keystroke

## Performance Considerations

### Database Queries
- Always use indexes on foreign keys
- Limit query results with pagination
- Use `SELECT` specific columns, avoid `SELECT *`
- Implement query result caching where appropriate

### Client-Side Performance
- Lazy load components not needed on initial render
- Implement virtual scrolling for large lists
- Optimize images (Next.js Image component)
- Minimize client-side JavaScript bundle

## Error Prevention

### Type Safety
- No `any` types and never use @ts-ignore - use `unknown` and type guards instead
- **NEVER use `any` or `@ts-ignore`** - Fix types, don't ignore them
- **Explicit return types on all functions**
- Exhaustive type checking with discriminated unions
- Generate types from database schema automatically

### Runtime Safety
- Validate external data (API responses, user input) with Zod
- Use optional chaining and nullish coalescing for nullable data
- Implement proper error boundaries in React
- Never assume data exists without checking

## Testing Approach
- Write integration tests for critical paths (auth, data mutations)
- Test server actions independently with mocked database
- Test authorization logic thoroughly
- Validate error handling paths

## Development Workflow

### Before Writing Code
1. Understand the data model and relationships
2. Identify which tables/schemas are affected
3. Plan the authorization requirements
4. Define input/output types
5. Consider error cases

### During Development
1. Start with database schema and migrations
2. Generate TypeScript types from schema
3. Implement server actions with full validation
4. Build UI components
5. Wire up with TanStack Query

### Code Review Checklist
- [ ] All server actions have authentication checks
- [ ] All server actions have authorization checks
- [ ] All inputs are validated with Zod
- [ ] All database operations are in try-catch
- [ ] No sensitive data exposed to client
- [ ] TypeScript has no errors or warnings
- [ ] No duplicated data definitions
- [ ] Foreign keys and relationships properly defined

## Anti-Patterns to Avoid

### Never Do These
- Never Store business logic in UI components
- Never Skip validation because "UI prevents invalid input"
- Never Use enums for content that changes
- Never Duplicate data across multiple tables
- Never Trust client-side authorization checks
- Never Use switch statements for type-based rendering when data-driven approach works
- Never Catch errors without logging or handling them
- Never Return different response shapes from same endpoint
- Never Mix authentication and business logic in same function
- Never Store derived data that can be calculated

## When Unsure

### Decision Framework
1. **Security**: When in doubt, be more restrictive or ask
2. **Data Structure**: When in doubt, normalize further and ask 
3. **Validation**: When in doubt, validate more strictly
4. **Types**: When in doubt, be more specific 
5. **Error Handling**: When in doubt, handle more cases

### Ask These Questions
- "What if this input is malicious?"
- "What if this database call fails?"
- "What if this user doesn't have permission?"
- "What if this data doesn't exist?"
- "What if two users do this simultaneously?"
- "Will this scale to 10,000 records?"