import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env.local");
    const content = readFileSync(envPath, "utf-8");
    const env = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

const env = { ...process.env, ...loadEnv() };
const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined. Set it in .env.local or as an env var.");
  process.exit(1);
}

const ADMIN_EMAIL = env.ADMIN_EMAIL || "admin@wallpaper-chan.com";
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "admin123";
const ADMIN_USERNAME = env.ADMIN_USERNAME || "admin";
const ADMIN_DISPLAY_NAME = env.ADMIN_DISPLAY_NAME || "Admin";

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    const users = db.collection("user");

    const existing = await users.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      if (existing.role !== "admin") {
        await users.updateOne({ _id: existing._id }, { $set: { role: "admin" } });
        console.log("Updated existing user role to admin.");
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const result = await users.insertOne({
      name: ADMIN_DISPLAY_NAME,
      displayName: ADMIN_DISPLAY_NAME,
      userName: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      emailVerified: true,
      img: null,
      role: "admin",
      hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`Admin user created successfully!`);
    console.log(`  ID:       ${result.insertedId}`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Username: ${ADMIN_USERNAME}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`\nChange the default password after first login!`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
