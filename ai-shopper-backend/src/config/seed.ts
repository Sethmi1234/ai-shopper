import bcrypt from "bcrypt";
import User from "../models/user.model";

export const seedDemoUser = async () => {
  try {
    const existingUser = await User.findOne({ email: "test1@example.com" });

    if (existingUser) {
      console.log("Demo user already exists, skipping seed.");
      return;
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.create({
      name: "Test User",
      email: "test1@example.com",
      password: hashedPassword,
    });

    console.log("Demo user seeded successfully (test1@example.com / password123)");
  } catch (error) {
    console.error("Failed to seed demo user:", error);
  }
};