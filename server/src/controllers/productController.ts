import { Request, Response } from "express";
import { sql, eq } from "drizzle-orm";
import { db } from "../db/client";
import { products } from "../db/schema";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchRaw = req.query.search;
    const productIdRaw = req.query.productId;

    const search =
      typeof searchRaw === "string" ? searchRaw.trim() : undefined;

    const productId =
      typeof productIdRaw === "string"
        ? decodeURIComponent(productIdRaw).trim()
        : undefined;

    // ✅ detail page use-case: /api/products?productId=<uuid>
    if (productId) {
      const rows = await db
        .select()
        .from(products)
        .where(eq(products.productId, productId));

      // keep same shape your frontend expects
      res.json({ products: rows });
      return;
    }

    // ✅ list/search: /api/products?search=term
    if (search) {
      const rows = await db
        .select()
        .from(products)
        .where(sql`lower(${products.name}) LIKE '%' || lower(${search}) || '%'`);

      res.json({ products: rows });
      return;
    }

    // ✅ list all
    const rows = await db.select().from(products);
    res.json({ products: rows });
  } catch (error) {
    console.error("❌ getProducts error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};
