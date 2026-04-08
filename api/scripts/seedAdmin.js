import mongoose from "mongoose";
import { connectDb } from "../src/db.js";
import { User } from "../src/models/User.js";

async function run() {
  await connectDb();
  const emailToPromote = process.argv[2];
  if (!emailToPromote) {
    console.log("Usage: node seedAdmin.js <email-of-user-to-promote>");
    process.exit(1);
  }

  try {
    const user = await User.findOneAndUpdate(
      { email: emailToPromote.toLowerCase() },
      { role: "admin" },
      { new: true }
    );
    if (!user) {
      console.log(`Could not find a user with email ${emailToPromote}`);
    } else {
      console.log(`Successfully promoted ${user.email} to Admin!`);
    }
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    mongoose.disconnect();
  }
}

run();
