import { Request, Response } from "express";
import { db } from "../db/client";
import { users } from "../db/schema";

export async function getAllUsers(_req: Request, res: Response) {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}
