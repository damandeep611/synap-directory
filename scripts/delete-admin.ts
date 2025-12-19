import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { user, account, session } from "../src/db/schema/auth";
import { eq } from "drizzle-orm";

config({ path: ".env" });

async function deleteAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.error("❌ ADMIN_EMAIL must be set in .env");
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log("🔍 Looking for admin user:", adminEmail);

    const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, adminEmail))
        .limit(1);

    if (existingUser.length === 0) {
        console.log("✅ No user found with that email");
        process.exit(0);
    }

    const userId = existingUser[0].id;
    console.log("📝 Deleting user and related records...");

    // Delete sessions first
    await db.delete(session).where(eq(session.userId, userId));
    console.log("   - Deleted sessions");

    // Delete accounts
    await db.delete(account).where(eq(account.userId, userId));
    console.log("   - Deleted accounts");

    // Delete user
    await db.delete(user).where(eq(user.id, userId));
    console.log("   - Deleted user");

    console.log("✅ Admin user deleted successfully!");
    process.exit(0);
}

deleteAdmin().catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
});
