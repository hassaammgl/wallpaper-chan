#!/usr/bin/env node
/**
 * Create or repair an admin user for Wallpaper-chan (better-auth + MongoDB).
 *
 * Better-auth's Mongo adapter maps user.id <-> MongoDB ObjectId _id.
 * Credential passwords live on the `account` collection with userId as ObjectId.
 *
 * Usage:
 *   bun run seed:admin
 *   bun run seed:admin -- --email you@example.com --password 'Secret123!' --username admin
 *   bun run promote:admin -- you@example.com
 */

import { MongoClient } from "mongodb";
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
  const args = {
    email: null,
    password: null,
    username: null,
    name: null,
    promoteOnly: false,
    resetPassword: true, // always repair password unless --no-reset-password
    help: false,
  };
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--promote-only" || a === "--promote") args.promoteOnly = true;
    else if (a === "--reset-password") args.resetPassword = true;
    else if (a === "--no-reset-password") args.resetPassword = false;
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
Create or repair an admin user (better-auth compatible).

  bun run seed:admin
  bun run seed:admin -- --email EMAIL --password PASS [--username NAME]
  bun run promote:admin -- EMAIL

Defaults:
  email:    admin@wallpaper-chan.com
  password: Admin@12345
  username: admin
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

function authUserId(user) {
  // better-auth mongo adapter uses ObjectId _id as the canonical user id
  return user._id;
}

async function upsertCredentialAccount(accounts, userObjectId, password, { force }) {
  const userIdStr = userObjectId.toHexString();
  const hashed = await hashPassword(password);

  // Remove broken legacy accounts (string ids / wrong userId shape)
  await accounts.deleteMany({
    providerId: "credential",
    $or: [
      { userId: userIdStr },
      { userId: userObjectId },
      { accountId: userIdStr },
      { accountId: userObjectId },
    ],
  });

  // Also wipe orphan credential rows that point at a non-ObjectId "id" field leftovers
  // (handled per-user below by caller when legacy string id exists)

  if (!force) {
    const existing = await accounts.findOne({
      providerId: "credential",
      userId: userObjectId,
    });
    if (existing?.password) return "account-exists";
  }

  await accounts.insertOne({
    userId: userObjectId,
    accountId: userIdStr,
    providerId: "credential",
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return force ? "password-reset" : "account-created";
}

async function repairAndPromote(users, accounts, existing) {
  const userObjectId = authUserId(existing);
  const legacyStringId =
    typeof existing.id === "string" && existing.id !== userObjectId.toHexString()
      ? existing.id
      : null;

  const updates = {
    role: "admin",
    blocked: false,
    email: ADMIN_EMAIL,
    emailVerified: true,
    updatedAt: new Date(),
  };

  if (!existing.userName) updates.userName = ADMIN_USERNAME;
  if (!existing.displayName && !existing.name) {
    updates.displayName = ADMIN_DISPLAY_NAME;
    updates.name = ADMIN_DISPLAY_NAME;
  } else {
    if (existing.displayName && !existing.name) updates.name = existing.displayName;
    if (existing.name && !existing.displayName) updates.displayName = existing.name;
  }

  // Drop legacy fields that break better-auth
  const unset = { hashedPassword: "" };
  if (legacyStringId) unset.id = "";

  await users.updateOne(
    { _id: userObjectId },
    { $set: updates, $unset: unset }
  );

  if (legacyStringId) {
    await accounts.deleteMany({
      providerId: "credential",
      $or: [{ userId: legacyStringId }, { accountId: legacyStringId }],
    });
  }

  let accountStatus = "skipped";
  if (!cli.promoteOnly) {
    accountStatus = await upsertCredentialAccount(
      accounts,
      userObjectId,
      ADMIN_PASSWORD,
      { force: cli.resetPassword }
    );
  }

  console.log("Admin account ready:");
  console.log(`  ID:       ${userObjectId.toHexString()}`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Username: ${updates.userName || existing.userName}`);
  console.log(`  Role:     admin`);
  console.log(`  Account:  ${accountStatus}`);
  if (accountStatus !== "skipped" && accountStatus !== "account-exists") {
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  }
  console.log("\nSign in at /auth, then open /admin");
}

async function createAdmin(users, accounts) {
  const usernameTaken = await users.findOne({ userName: ADMIN_USERNAME });
  if (usernameTaken && usernameTaken.email?.toLowerCase() !== ADMIN_EMAIL) {
    console.error(`Username "${ADMIN_USERNAME}" is already taken by another account.`);
    process.exit(1);
  }

  const now = new Date();
  const result = await users.insertOne({
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

  const userObjectId = result.insertedId;
  await upsertCredentialAccount(accounts, userObjectId, ADMIN_PASSWORD, {
    force: true,
  });

  console.log("Admin user created:");
  console.log(`  ID:       ${userObjectId.toHexString()}`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Username: ${ADMIN_USERNAME}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log("\nSign in at /auth, then open /admin");
  console.log("Change the default password after first login.");
}

async function main() {
  const client = new MongoClient(MONGODB_URI, {
    tls: MONGODB_URI.includes("mongodb+srv") || MONGODB_URI.includes("tls=true"),
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection("user");
    const accounts = db.collection("account");

    const existing =
      (await users.findOne({ email: ADMIN_EMAIL })) ||
      (await users.findOne({
        email: new RegExp(
          `^${ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      }));

    if (cli.promoteOnly && !existing) {
      console.error(`No user found with email: ${ADMIN_EMAIL}`);
      console.error("Register first, or run without --promote-only to create an admin.");
      process.exit(1);
    }

    if (existing) {
      await repairAndPromote(users, accounts, existing);
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
