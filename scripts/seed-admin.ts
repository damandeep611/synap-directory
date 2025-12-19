import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { user, account } from "../src/db/schema/auth";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

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

    console.log("� Checking if admin user exists...");

    // Check if admin already exists
    const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, adminEmail))
        .limit(1);

    if (existingUser.length > 0) {
        console.log("✅ Admin user already exists:", adminEmail);

        // Update role to admin if not already
        if (existingUser[0].role !== "admin") {
            await db
                .update(user)
                .set({ role: "admin" })
                .where(eq(user.email, adminEmail));
            console.log("✅ Updated user role to admin");
        }

        process.exit(0);
    }

    console.log("📝 Creating admin user...");

    // Generate IDs
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();
    const now = new Date();

    // Hash password using better-auth's crypto utility
    const hashedPassword = await hashPassword(adminPassword);

    // Create user
    await db.insert(user).values({
        id: userId,
        name: "Admin",
        email: adminEmail,
        emailVerified: true,
        role: "admin",
        createdAt: now,
        updatedAt: now,
    });

    // Create account with password
    await db.insert(account).values({
        id: accountId,
        accountId: userId,
        providerId: "credential",
        userId: userId,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
    });

    console.log("✅ Admin user created successfully!");
    console.log("   Email:", adminEmail);
    process.exit(0);
}

seedAdmin().catch((err) => {
    console.error("❌ Failed to seed admin:", err);
    process.exit(1);
});
