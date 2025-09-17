const { Client } = require("pg");

const connectionString =
  "postgresql://postgres:vtwyKVDTWAyWySGhzxYJpBpEJPjsiiLN@crossover.proxy.rlwy.net:39737/railway";

async function fixKnowledgeTable() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected to Railway production database\n");

    // First, enable pgvector extension if not already enabled
    console.log("Enabling pgvector extension...");
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS vector`);
      console.log("✅ pgvector extension enabled");
    } catch (err) {
      console.log("⚠️ Could not enable pgvector:", err.message);
    }

    // Fix embedding column type
    console.log("\nFixing embedding column type...");
    try {
      // First, drop the old column
      await client.query(`ALTER TABLE knowledge_base DROP COLUMN IF EXISTS embedding`);
      // Then add it with the correct type
      await client.query(`ALTER TABLE knowledge_base ADD COLUMN embedding vector(1536)`);
      console.log("✅ Fixed embedding column to vector(1536)");
    } catch (err) {
      console.log("⚠️ Could not fix embedding column:", err.message);
      // Try alternative approach - store as JSONB array
      console.log("Using JSONB for embedding instead...");
      await client.query(`ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS embedding jsonb`);
    }

    // Fix tags column type
    console.log("\nFixing tags column type...");
    try {
      // Convert existing JSONB data to text array
      await client.query(`
        ALTER TABLE knowledge_base
        ALTER COLUMN tags TYPE text[]
        USING CASE
          WHEN tags IS NULL THEN NULL
          WHEN jsonb_typeof(tags) = 'array' THEN ARRAY(SELECT jsonb_array_elements_text(tags))
          ELSE ARRAY[]::text[]
        END
      `);
      console.log("✅ Fixed tags column to text[]");
    } catch (err) {
      console.log("⚠️ Could not fix tags column:", err.message);
      // If that fails, drop and recreate
      try {
        await client.query(`ALTER TABLE knowledge_base DROP COLUMN IF EXISTS tags`);
        await client.query(`ALTER TABLE knowledge_base ADD COLUMN tags text[]`);
        console.log("✅ Recreated tags column as text[]");
      } catch (err2) {
        console.log("❌ Failed to fix tags column:", err2.message);
      }
    }

    // Verify final structure
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'knowledge_base'
      AND column_name IN ('embedding', 'tags', 'created_by', 'metadata', 'is_public')
      ORDER BY column_name
    `);

    console.log("\nRelevant columns in knowledge_base:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log("\n✅ Database fixes complete!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Details:", error);
  } finally {
    await client.end();
  }
}

fixKnowledgeTable();
