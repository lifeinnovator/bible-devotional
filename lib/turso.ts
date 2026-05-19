import { createClient } from '@libsql/client';

const config = {
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
  fetch: (url: string, init: RequestInit) => {
    return fetch(url, { ...init, cache: "no-store" });
  }
};

export const turso = createClient(config);
