import { Request, Response } from "express";
import { sql } from "drizzle-orm";

import { db } from "../db/client";
import { products } from "../db/schema";

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = (req.query.search as string | undefined)?.trim() ?? "";

    let result;

    if (!search) {
      // No search → return all products
      result = await db.select().from(products);
    } else {
      // SQLite case-insensitive search
      result = await db
        .select()
        .from(products)
        .where(
          sql`lower(${products.name}) LIKE '%' || lower(${search}) || '%'`
        );
    }

    res.json({ products: result });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({ message: "Error searching products" });
  }
};
