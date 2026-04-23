#!/usr/bin/env node

import { readFileSync } from 'node:fs';

function loadDotEnv() {
  try {
    const env = readFileSync('.env', 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...valueParts] = trimmed.split('=');
      process.env[key] ??= valueParts.join('=');
    }
  } catch {
    // .env is optional; CI can provide environment variables directly.
  }
}

loadDotEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const response = await fetch(`${url}/rest/v1/study_states?select=user_id&limit=1`, {
  headers: {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
  },
});

if (response.ok) {
  console.log('Supabase study_states table is reachable.');
  process.exit(0);
}

const body = await response.text();
console.error(`Supabase study_states check failed (${response.status}).`);
console.error(body);
process.exit(1);
