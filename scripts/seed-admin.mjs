#!/usr/bin/env node
/**
 * Create or promote an admin user for Wallpaper-chan (better-auth + MongoDB).
 *
 * Usage:
 *   bun run seed:admin
 *   bun run seed:admin -- --email you@example.com --password 'Secret123!' --username admin
 *   bun run promote:admin -- you@example.com
 *
 * Env (optional, from .env.local / .env):
 *   MONGODB_URI (required)
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, ADMIN_DISPLAY_NAME
 */

import { MongoClient } from "mongodb";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[trimmed.slice(0, eqIdx).trim()] = value;
  }
  return env;
}

function parseArgs(argv) {
  const args = { email: null, password: null, username: null, name: null, promoteOnly: false, resetPassword: false };
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--promote-only" || a === "--promote") args.promoteOnly = true;
    else if (a === "--reset-password") args.resetPassword = true;
    else if (a === "--email") args.email = argv[++i];
    else if (a === "--password") args.password = argv[++i];
    else if (a === "--username" || a === "--userName") args.username = argv[++i];
    else if (a === "--name" || a === "--displayName") args.name = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
    else if (!a.startsWith("-")) positional.push(a);
  }

  if (positional[0] && !args.email) args.email = positional[0];
  if (positional[1] && !args.password) args.password = positional[1];
  return args;
}

function printHelp() {
  console.log(`
Create or promote an admin user.

  node scripts/seed-admin.mjs [email] [password]
  node scripts/seed-admin.mjs --email EMAIL --password PASS [--username NAME] [--name DISPLAY]
  node scripts/seed-admin.mjs --promote-only --email EMAIL
  node scripts/seed-admin.mjs --email EMAIL --password PASS --reset-password

Defaults come from ADMIN_* env vars or:
  email:    admin@wallpaper-chan.com
  password: Admin@12345
  username: admin
  name:     Admin
`);
}

const fileEnv = {
  ...loadEnvFile(resolve(__dirname, "../.env")),
  ...loadEnvFile(resolve(__dirname, "../.env.local")),
};
const env = { ...fileEnv, ...process.env };
const cli = parseArgs(process.argv.slice(2));

if (cli.help) {
  printHelp();
  process.exit(0);
}

const MONGODB_URI = env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined. Set it in .env.local or as an env var.");
  process.exit(1);
}

const ADMIN_EMAIL = (cli.email || env.ADMIN_EMAIL || "admin@wallpaper-chan.com").toLowerCase();
const ADMIN_PASSWORD = cli.password || env.ADMIN_PASSWORD || "Admin@12345";
const ADMIN_USERNAME = cli.username || env.ADMIN_USERNAME || "admin";
const ADMIN_DISPLAY_NAME = cli.name || env.ADMIN_DISPLAY_NAME || "Admin";

function userIdOf(doc) {
  return doc?.id || doc?._id?.toString();
}

async function ensureCredentialAccount(accounts, userId, password, { force = false } = {}) {
  const existing = await accounts.findOne({
    userId,
    providerId: "credential",
  });

  const hashed = await hashPassword(password);

  if (existing) {
    if (force || !existing.password) {
      await accounts.updateOne(
        { _id: existing._id },
        { $set: { password: hashed, updatedAt: new Date() } }
      );
      return force ? "password-reset" : "password-set";
    }
    return "account-exists";
  }

  const accountId = generateId();
  await accounts.insertOne({
    id: accountId,
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return "account-created";
}

async function promoteExisting(users, accounts, existing) {
  const userId = userIdOf(existing);
  const updates = { role: "admin", blocked: false, updatedAt: new Date() };

  if (!existing.userName) updates.userName = ADMIN_USERNAME;
  if (!existing.displayName && !existing.name) {
    updates.displayName = ADMIN_DISPLAY_NAME;
    updates.name = ADMIN_DISPLAY_NAME;
  }

  await users.updateOne(
    existing.id ? { id: existing.id } : { _id: existing._id },
    { $set: updates }
  );

  let accountStatus = "skipped";
  if (!cli.promoteOnly) {
    accountStatus = await ensureCredentialAccount(accounts, userId, ADMIN_PASSWORD, {
      force: cli.resetPassword,
    });
  }

  console.log("Promoted existing user to admin:");
  console.log(`  ID:       ${userId}`);
  console.log(`  Email:    ${existing.email}`);
  console.log(`  Username: ${updates.userName || existing.userName}`);
  console.log(`  Role:     admin`);
  console.log(`  Account:  ${accountStatus}`);
  if (accountStatus === "password-reset" || accountStatus === "password-set" || accountStatus === "account-created") {
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  }
}

async function createAdmin(users, accounts) {
  const usernameTaken = await users.findOne({ userName: ADMIN_USERNAME });
  if (usernameTaken && usernameTaken.email?.toLowerCase() !== ADMIN_EMAIL) {
    console.error(`Username "${ADMIN_USERNAME}" is already taken by another account.`);
    process.exit(1);
  }

  const userId = generateId();
  const now = new Date();

  await users.insertOne({
    id: userId,
    name: ADMIN_DISPLAY_NAME,
    displayName: ADMIN_DISPLAY_NAME,
    userName: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    emailVerified: true,
    image: null,
    img: null,
    role: "admin",
    blocked: false,
    createdAt: now,
    updatedAt: now,
  });

  await ensureCredentialAccount(accounts, userId, ADMIN_PASSWORD);

  console.log("Admin user created:");
  console.log(`  ID:       ${userId}`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Username: ${ADMIN_USERNAME}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log("\nSign in, then open /admin");
  console.log("Change the default password after first login.");
}

async function main() {
  const client = new MongoClient(MONGODB_URI, {
    tls: MONGODB_URI.includes("mongodb+srv"),
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection("user");
    const accounts = db.collection("account");

    // Prefer matching by email; also allow ObjectId-looking emails? no.
    const existing =
      (await users.findOne({ email: ADMIN_EMAIL })) ||
      (await users.findOne({ email: new RegExp(`^${ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }));

    if (cli.promoteOnly && !existing) {
      console.error(`No user found with email: ${ADMIN_EMAIL}`);
      console.error("Register first, or run without --promote-only to create an admin.");
      process.exit(1);
    }

    if (existing) {
      await promoteExisting(users, accounts, existing);
      return;
    }

    await createAdmin(users, accounts);
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
