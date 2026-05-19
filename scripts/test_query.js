const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const client = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

async function check() {
  const res = await client.execute("SELECT date, bible_book, title FROM meditations WHERE title LIKE '%출애굽기%' OR title LIKE '%사사기%' OR title LIKE '%사무엘상%' LIMIT 20");
  console.log("Found rows:");
  console.log(JSON.stringify(res.rows, null, 2));
  
  const countRes = await client.execute("SELECT COUNT(*) as count FROM meditations WHERE bible_book = ''");
  console.log("\nTotal empty bible_book count:", countRes.rows[0].count);
}

check().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
