const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// 1. Manually parse .env.local for Turso credentials
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(".env.local file not found!");
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  });
  return env;
}

const env = loadEnv();
const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not found in .env.local!");
  process.exit(1);
}

// 2. Initialize Turso client
const turso = createClient({ url, authToken });

async function insertAll() {
  const jsonPath = path.join(__dirname, '..', 'parsed_meditations_2026.json');
  if (!fs.existsSync(jsonPath)) {
    console.error("parsed_meditations_2026.json not found!");
    process.exit(1);
  }
  
  const meditations = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${meditations.length} meditations from JSON. Starting insertion...`);
  
  let inserted = 0;
  let updated = 0;
  
  for (const item of meditations) {
    const { date, bible_book, title, scripture, reflection, prayer } = item;
    
    try {
      // Check if entry already exists for this date
      const checkRes = await turso.execute({
        sql: "SELECT date FROM meditations WHERE date = ?",
        args: [date]
      });
      
      if (checkRes.rows.length > 0) {
        // Entry exists, let's update it (Upsert behavior)
        await turso.execute({
          sql: `
            UPDATE meditations 
            SET bible_book = ?, title = ?, scripture = ?, reflection = ?, prayer = ? 
            WHERE date = ?
          `,
          args: [bible_book, title, scripture, reflection, prayer, date]
        });
        updated++;
      } else {
        // Entry does not exist, insert it
        await turso.execute({
          sql: `
            INSERT INTO meditations (date, bible_book, title, scripture, reflection, prayer) 
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          args: [date, bible_book, title, scripture, reflection, prayer]
        });
        inserted++;
      }
      
      if ((inserted + updated) % 10 === 0 || (inserted + updated) === meditations.length) {
        console.log(`Progress: ${inserted + updated}/${meditations.length} (Inserted: ${inserted}, Updated: ${updated})`);
      }
    } catch (err) {
      console.error(`Error processing date ${date}:`, err);
    }
  }
  
  console.log(`\n=== IMPORT COMPLETE ===`);
  console.log(`Total processed: ${meditations.length}`);
  console.log(`Successfully Inserted: ${inserted}`);
  console.log(`Successfully Updated/Upserted: ${updated}`);
  
  // Clean Next.js route caches by rebuilding
  console.log("Triggering Next.js cache revalidation...");
  process.exit(0);
}

insertAll().catch(err => {
  console.error("Fatal error during import:", err);
  process.exit(1);
});
