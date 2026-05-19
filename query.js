import { createClient } from "@libsql/client";

const client = createClient({
  url: "https://dailybible-lifeinnovator.aws-ap-northeast-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsImtpZCI6IjIwMjQtMDItMjQifQ.eyJhdWQiOlsidHVyc28iXSwiZXhwIjo0OTMwOTEyODgxLCJpYXQiOjE3NzcyNzI4ODEsImlzcyI6InR1cnNvIiwiemlwIjoiREVGTiIsInpwaSI6eyJwcm9qZWN0IjoibGlmZWlubm92YXRvciJ9fQ.9yU2G7K9B2Dk5dCq3Y4_Zl8Jv5W8T4M5P3H0G9X2Z4K8Q7L1R3N6J5M2T1B8V9C7X0Z4M5J8H2K3D1L7Y4G9Aw"
});

async function run() {
  const r = await client.execute("SELECT date FROM meditations LIMIT 3");
  console.log(r.rows);
}
run();
