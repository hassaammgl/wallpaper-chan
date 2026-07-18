#!/usr/bin/env node
/**
 * Promote an existing user to admin by email.
 *
 * Usage:
 *   bun run promote:admin -- you@example.com
 *   node scripts/promote-admin.mjs you@example.com
 */

import { spawnSync } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const email = process.argv[2];

if (!email || email === "--help" || email === "-h") {
  console.log(`Usage: node scripts/promote-admin.mjs <email>`);
  process.exit(email ? 0 : 1);
}

const result = spawnSync(
  process.execPath,
  [resolve(__dirname, "seed-admin.mjs"), "--promote-only", "--email", email],
  { stdio: "inherit" }
);

process.exit(result.status ?? 1);
