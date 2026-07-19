#!/usr/bin/env node
/**
 * Reassign all existing wallpapers (pins) to the admin user.
 *
 * Usage:
 *   bun run reassign:pins
 *   bun run reassign:pins -- --email admin@wallpaper-chan.com
 */

import { MongoClient } from "mongodb";
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
  const args = { email: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--email") args.email = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
    else if (!a.startsWith("-") && !args.email) args.email = a;
  }
  return args;
}

const fileEnv = {
  ...loadEnvFile(resolve(__dirname, "../.env")),
  ...loadEnvFile(resolve(__dirname, "../.env.local")),
};
const env = { ...fileEnv, ...process.env };
const cli = parseArgs(process.argv.slice(2));

if (cli.help) {
  console.log(`Usage: bun run reassign:pins [-- --email admin@...]`);
  process.exit(0);
}

const MONGODB_URI = env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined.");
  process.exit(1);
}

const ADMIN_EMAIL = (
  cli.email ||
  env.ADMIN_EMAIL ||
  "admin@wallpaper-chan.com"
).toLowerCase();

async function main() {
  const client = new MongoClient(MONGODB_URI, {
    tls: MONGODB_URI.includes("mongodb+srv") || MONGODB_URI.includes("tls=true"),
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection("user");
    // Mongoose model "Pin" -> collection "pins"
    const pinCol = db.collection("pins");

    const admin =
      (await users.findOne({ email: ADMIN_EMAIL, role: "admin" })) ||
      (await users.findOne({ role: "admin" })) ||
      (await users.findOne({
        email: new RegExp(
          `^${ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      }));

    if (!admin) {
      console.error(
        `No admin user found. Run: bun run seed:admin\nLooked for email: ${ADMIN_EMAIL}`
      );
      process.exit(1);
    }

    if (admin.role !== "admin") {
      await users.updateOne({ _id: admin._id }, { $set: { role: "admin" } });
      console.log("Promoted user to admin before reassignment.");
    }

    const adminId = admin.id || admin._id.toString();
    const total = await pinCol.countDocuments();
    const before = await pinCol.countDocuments({ user: { $ne: adminId } });

    const result = await pinCol.updateMany(
      { user: { $ne: adminId } },
      { $set: { user: adminId, updatedAt: new Date() } }
    );

    console.log("Reassigned wallpapers to admin:");
    console.log(`  Admin:      ${admin.email} (${admin.userName || "n/a"})`);
    console.log(`  Admin ID:   ${adminId}`);
    console.log(`  Collection: ${pinCol.collectionName}`);
    console.log(`  Total pins: ${total}`);
    console.log(`  Updated:    ${result.modifiedCount} (were non-admin: ${before})`);
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
