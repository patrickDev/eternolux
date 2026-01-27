import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "../db/client";
import { users } from "../db/schema";

export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName || !email || !password || !phone) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    // Check if user exists
    const existingUser = await db
      .select({ userId: users.userId })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      userId: crypto.randomUUID(),
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
      isAdmin: false,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
