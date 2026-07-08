import User from "../models/user.model.js";
import connectDB from "./connectDB.js";
import dotenv from "dotenv";

dotenv.config();

const promoteAdmin = async (email) => {
  await connectDB();

  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  ).select("userName email role");

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`Promoted to admin:`, user);
  process.exit(0);
};

const email = process.argv[2];
if (!email) {
  console.log("Usage: node src/utils/promoteAdmin.js <email>");
  process.exit(1);
}

promoteAdmin(email);
