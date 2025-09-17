const { Client } = require("pg");

const connectionString =
  "postgresql://postgres:vtwyKVDTWAyWySGhzxYJpBpEJPjsiiLN@crossover.proxy.rlwy.net:39737/railway";

async function checkKnowledgeTable() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected to Railway production database\n");

    // Check if knowledge_base table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'knowledge_base'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("❌ Table knowledge_base does not exist!");
      console.log("\nCreating knowledge_base table...");

      await client.query(`
        CREATE TABLE knowledge_base (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          embedding VECTOR(1536),
          tags TEXT[],
          knowledge_type VARCHAR(50),
          is_public BOOLEAN DEFAULT false,
          created_by VARCHAR(255),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log("✅ Created knowledge_base table");

      // Create indexes
      await client.query(`CREATE INDEX idx_knowledge_base_org ON knowledge_base(organization_id)`);
      await client.query(`CREATE INDEX idx_knowledge_base_type ON knowledge_base(knowledge_type)`);
      console.log("✅ Created indexes");
    } else {
      console.log("✅ Table knowledge_base exists");
    }

    // Check columns
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'knowledge_base'
      ORDER BY ordinal_position
    `);

    console.log("\nCurrent columns in knowledge_base:");
    const columns = result.rows.map((row) => row.column_name);
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    // Check for required columns and add if missing
    const requiredColumns = [
      { name: "organization_id", sql: "UUID" },
      { name: "title", sql: "VARCHAR(255)" },
      { name: "content", sql: "TEXT" },
      { name: "embedding", sql: "VECTOR(1536)" },
      { name: "tags", sql: "TEXT[]" },
      { name: "knowledge_type", sql: "VARCHAR(50)" },
      { name: "is_public", sql: "BOOLEAN DEFAULT false" },
      { name: "created_by", sql: "VARCHAR(255)" },
      { name: "metadata", sql: "JSONB DEFAULT '{}'::jsonb" },
      { name: "created_at", sql: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
      { name: "updated_at", sql: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
    ];

    for (const col of requiredColumns) {
      if (!columns.includes(col.name)) {
        console.log(`\n⚠️ Missing column: ${col.name}`);
        try {
          await client.query(`ALTER TABLE knowledge_base ADD COLUMN ${col.name} ${col.sql}`);
          console.log(`✅ Added ${col.name} column`);
        } catch (err) {
          console.log(`❌ Error adding ${col.name}:`, err.message);
        }
      }
    }

    // Check if knowledge_to_categories table exists
    const joinTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'knowledge_to_categories'
      )
    `);

    if (!joinTableCheck.rows[0].exists) {
      console.log("\n❌ Table knowledge_to_categories does not exist!");
      console.log("Creating knowledge_to_categories table...");

      await client.query(`
        CREATE TABLE knowledge_to_categories (
          knowledge_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
          category_id UUID REFERENCES knowledge_categories(id) ON DELETE CASCADE,
          PRIMARY KEY (knowledge_id, category_id)
        )
      `);

      console.log("✅ Created knowledge_to_categories table");
    } else {
      console.log("\n✅ Table knowledge_to_categories exists");
    }

    console.log("\n✅ Database check complete!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Details:", error);
  } finally {
    await client.end();
  }
}

checkKnowledgeTable();
