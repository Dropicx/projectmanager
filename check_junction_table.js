const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgresql://postgres:vtwyKVDTWAyWySGhzxYJpBpEJPjsiiLN@crossover.proxy.rlwy.net:39737/railway",
});

async function checkJunctionTable() {
  try {
    await client.connect();
    console.log("Connected to database\n");

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_to_categories'
      );
    `);
    console.log("Table exists:", tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get table structure
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_to_categories'
        ORDER BY ordinal_position;
      `);
      console.log("\nTable structure:");
      console.table(structure.rows);

      // Check constraints
      const constraints = await client.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'knowledge_to_categories';
      `);
      console.log("\nConstraints:");
      console.table(constraints.rows);

      // Check foreign keys
      const foreignKeys = await client.query(`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'knowledge_to_categories';
      `);
      console.log("\nForeign keys:");
      console.table(foreignKeys.rows);
    } else {
      console.log("\nTable does not exist! Creating it now...");

      // Create the junction table
      await client.query(`
        CREATE TABLE IF NOT EXISTS knowledge_to_categories (
          knowledge_id UUID NOT NULL,
          category_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (knowledge_id, category_id),
          FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES knowledge_categories(id) ON DELETE CASCADE
        );
      `);
      console.log("Table created successfully!");

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_knowledge_to_categories_knowledge_id ON knowledge_to_categories(knowledge_id);
        CREATE INDEX IF NOT EXISTS idx_knowledge_to_categories_category_id ON knowledge_to_categories(category_id);
      `);
      console.log("Indexes created successfully!");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkJunctionTable();
