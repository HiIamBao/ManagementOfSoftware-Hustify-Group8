const { execSync } = require("child_process");

try {
  // Run the TypeScript file through ts-node
  console.log("Seeding database...");
  require("./scripts/seed-data.js");
  console.log("Database seeded successfully!");
} catch (error) {
  console.error("Failed to seed database:", error);
}
