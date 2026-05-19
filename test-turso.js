const { createClient } = require('@libsql/client');
const client = createClient({
  url: 'https://dailybible-lifeinnovator.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzkwOTQ3MzQsImlkIjoiMDE5ZTJhMDctYjYwMS03N2IyLTk2YjMtODRlNzQ1NjQzNmE4IiwicmlkIjoiZjBiYWE3ZTEtZTk0ZS00ZDc0LThiYjAtYWJiN2QxYThlZDU4In0.HZgcRmXR4kdkUeataqdpd2JqLjb6_94oR3DEu2YgD5Mij86P3j6iAyz8_m-swGeWm-xp9Of-aZsyAb-H1nySDA'
});

async function main() {
  try {
    const res = await client.execute("SELECT date FROM meditations LIMIT 3");
    console.log("Success:", res.rows);
  } catch(e) {
    console.error("Error:", e);
  }
}
main();
