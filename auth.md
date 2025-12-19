# Admin Authentication with Better-Auth

A guide to implementing single-admin authentication with better-auth, Drizzle ORM, and Next.js 16.

guide
## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Auth Library | better-auth |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Runtime | Bun |

---

## Required Environment Variables

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<32+ character secret>
BETTER_AUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

---

## File Structure

```
src/
├── app/
│   ├── api/auth/[...all]/route.ts   # API handler
│   └── admin/
│       ├── page.tsx                  # Login page
│       └── dashboard/page.tsx        # Protected dashboard
├── db/
│   ├── drizzle.ts                    # DB connection
│   └── schema/auth.ts                # Auth tables
└── utils/
    ├── auth.ts                       # Server auth config
    └── auth-client.ts                # Client auth hooks
scripts/
├── seed-admin.ts                     # Seed admin user
└── delete-admin.ts                   # Delete admin (helper)
```

---

## Step-by-Step Implementation

### 1. Install Dependencies

```bash
bun add better-auth
```

### 2. Database Schema (`src/db/schema/auth.ts`)

```typescript
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: text("role").default("user"),  // "admin" or "user"
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),  // Hashed password stored here
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
```

### 3. Server Auth Config (`src/utils/auth.ts`)

```typescript
import { db } from "@/db/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import * as schema from "@/db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,  // CRITICAL: Must pass schema for Drizzle adapter
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - cache session in signed cookie
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
```

**Why each option matters:**
- `schema: schema` - Drizzle adapter needs the schema object to find user/session/account tables
- `cookieCache.enabled: true` - **Prevents logout on route changes** by caching session in a signed cookie (avoids DB call on every navigation)
- `cookieCache.maxAge: 5 * 60` - Session cookie is refreshed every 5 minutes

### 4. API Route Handler (`src/app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/utils/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

**Why:** Catch-all route to handle all `/api/auth/*` endpoints (sign-in, sign-out, session, etc.)

### 5. Client Auth Hooks (`src/utils/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: 
    typeof window !== "undefined" 
      ? window.location.origin 
      : "http://localhost:3000",
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include", // Ensures cookies are sent with requests
  },
});

export const { signIn, signOut, useSession } = authClient;
```

**Why each option matters:**
- `window.location.origin` - Uses correct URL automatically (works in dev and production)
- `credentials: "include"` - **Ensures session cookie is sent** with every auth request during navigation
- `adminClient()` - Enables admin-specific methods if needed later

### 6. Seed Admin Script (`scripts/seed-admin.ts`)

```typescript
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { user, account } from "../src/db/schema/auth";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";  // CRITICAL: Use this

config({ path: ".env" });

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  // Check if exists
  const existingUser = await db
    .select().from(user)
    .where(eq(user.email, adminEmail))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("✅ Admin already exists");
    if (existingUser[0].role !== "admin") {
      await db.update(user).set({ role: "admin" }).where(eq(user.email, adminEmail));
    }
    process.exit(0);
  }

  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const now = new Date();
  const hashedPassword = await hashPassword(adminPassword);

  await db.insert(user).values({
    id: userId,
    name: "Admin",
    email: adminEmail,
    emailVerified: true,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: accountId,
    accountId: userId,
    providerId: "credential",
    userId: userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  console.log("✅ Admin created:", adminEmail);
}

seedAdmin();
```

**Why:** Seeds admin directly to database using `hashPassword` from better-auth/crypto (ensures password hash matches what better-auth expects during login)

---

## Auth Flow Patterns

### Login Page (`/admin/page.tsx`) - Redirect if Already Logged In

```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/utils/auth-client";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isPending && session) {
      router.push("/admin/dashboard");
    }
  }, [session, isPending, router]);

  // Show loading while checking session
  if (isPending || session) {
    return <LoadingSpinner />;
  }

  // Show login form only if not logged in
  return <LoginForm />;
}
```

**Why:** Prevents logged-in users from seeing the login page again. Checks session status and redirects to dashboard.

### Protected Dashboard (`/admin/dashboard/page.tsx`)

```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/utils/auth-client";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin");
    }
  }, [session, isPending, router]);

  // Show loading while checking session
  if (isPending) return <LoadingSpinner />;
  
  // Don't render content if not logged in
  if (!session) return null;

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push("/admin");
  };

  return <DashboardContent session={session} onLogout={handleLogout} />;
}
```

**Why:** Protects the dashboard by checking session. Redirects unauthenticated users to login page.

---

## Setup Commands

```bash
# 1. Push schema to database
bunx drizzle-kit push

# 2. Seed admin user
bun run scripts/seed-admin.ts

# 3. Start dev server
bun run dev
```

---

## Common Errors & Solutions

### ❌ Error: "The model 'user' was not found in the schema object"

**Cause:** Drizzle adapter requires the schema to be passed explicitly.

**Fix:** Add `schema: schema` to the Drizzle adapter config:
```typescript
drizzleAdapter(db, {
  provider: "pg",
  schema: schema,  // Add this line
})
```

---

### ❌ Error: "Invalid password" (despite correct password)

**Cause:** Password was hashed using a different algorithm than better-auth expects.

**Fix:** Use `hashPassword` from `better-auth/crypto`:
```typescript
import { hashPassword } from "better-auth/crypto";
const hashedPassword = await hashPassword(plainPassword);
```

**Do NOT use:**
- Custom scrypt/bcrypt implementations
- Node.js crypto directly
- Any other hashing library

---

### ❌ Error: "FAILED_TO_CREATE_USER" via API

**Cause:** Using the signup API endpoint requires the server to be running and may have additional validation.

**Fix:** Seed directly to database using Drizzle + `hashPassword` from better-auth/crypto.

---

### ❌ Session Lost on Route Navigation

**Cause:** Without cookie caching, every `useSession()` call hits the database. Slow DB responses or network issues can cause session loss.

**Fix:** Enable cookie caching in server auth config:
```typescript
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes
  },
}
```

---

### ❌ Login Page Shown Even When Logged In

**Cause:** Login page doesn't check for existing session.

**Fix:** Add session check with redirect in login page:
```typescript
const { data: session, isPending } = useSession();

useEffect(() => {
  if (!isPending && session) {
    router.push("/admin/dashboard");
  }
}, [session, isPending, router]);
```

---

## Key Takeaways

1. **Always pass schema to Drizzle adapter** - better-auth needs to find tables
2. **Always use `better-auth/crypto` for password hashing** - custom implementations won't match
3. **Password is stored in `account` table**, not `user` table
4. **`providerId: "credential"`** is required for email/password auth
5. **Role is stored in `user.role`** - set to "admin" for admin access
6. **Enable cookie caching** - prevents session loss during navigation
7. **Check session on both login and protected pages** - login page should redirect if already authenticated, protected pages should redirect if not authenticated
