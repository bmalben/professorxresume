import mongoose from "mongoose";
import { connectDb } from "../db.js";
import { User } from "../models/User.js";
import { config } from "../config.js";

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address. Example: node seedAdmin.js test@example.com");
  process.exit(1);
}

async function run() {
  await connectDb();
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "admin" },
    { new: true }
  );

  if (user) {
    console.log(`Success! ${user.email} is now an admin.`);
  } else {
    console.log(`User with email ${email} not found.`);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
