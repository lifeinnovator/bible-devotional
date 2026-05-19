const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const config = {
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

const client = createClient(config);

async function migrate() {
  try {
    console.log('Reading meditations.json...');
    const dataPath = path.join(__dirname, '../src/data/meditations.json');
    const meditations = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Found ${meditations.length} records.`);

    // 1. Create table
    console.log('Ensuring table exists...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.executeMultiple(schema);

    // 2. Batch insert
    console.log('Starting migration...');
    const batchSize = 50;
    for (let i = 0; i < meditations.length; i += batchSize) {
      const batch = meditations.slice(i, i + batchSize);
      const statements = batch.map(m => ({
        sql: `INSERT OR IGNORE INTO meditations (legacy_id, date, bible_book, title, scripture, reflection, prayer, raw_content) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          m.id,
          m.date,
          m.bible_book,
          m.title,
          m.scripture,
          m.reflection,
          m.prayer,
          m.raw || ''
        ]
      }));

      await client.batch(statements, "write");
      console.log(`Migrated ${Math.min(i + batchSize, meditations.length)} / ${meditations.length}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // client.close() might be needed depending on the version, but usually not for the serverless client
  }
}

migrate();
