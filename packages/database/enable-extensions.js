const postgres = require("postgres");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:vtwyKVDTWAyWySGhzxYJpBpEJPjsiiLN@crossover.proxy.rlwy.net:39737/railway";

async function enableExtensions() {
  console.log("Connecting to database...");
  const client = postgres(DATABASE_URL);

  try {
    console.log("Enabling PostgreSQL extensions...");

    // Enable UUID extension (gen_random_uuid function)
    await client`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log("✓ uuid-ossp extension enabled");

    // Alternative: Enable pgcrypto (also provides gen_random_uuid)
    await client`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
    console.log("✓ pgcrypto extension enabled");

    // Enable pgvector for embeddings (for future RAG features)
    try {
      await client`CREATE EXTENSION IF NOT EXISTS "vector"`;
      console.log("✓ pgvector extension enabled");
    } catch (_err) {
      console.log("⚠ pgvector extension not available (optional for embeddings)");
    }

    console.log("\n✅ Extensions enabled successfully!");
  } catch (error) {
    console.error("Error enabling extensions:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

enableExtensions();
