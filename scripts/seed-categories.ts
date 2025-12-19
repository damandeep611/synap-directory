import { db } from "../src/db/drizzle";
import { categories } from "../src/db/schema/content";

const main = async () => {
  console.log("Seeding categories...");

  const seeds = [
    {
      id: crypto.randomUUID(),
      name: "Apps & Tools",
      slug: "apps-and-tools",
    },
    {
      id: crypto.randomUUID(),
      name: "Articles",
      slug: "articles",
    },
  ];

  for (const seed of seeds) {
    await db.insert(categories).values(seed).onConflictDoNothing();
    console.log(`Inserted category: ${seed.name}`);
  }

  console.log("Seeding complete.");
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
