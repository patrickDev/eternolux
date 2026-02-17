// src/controllers/searchController.ts
import { Request, Response } from "express";
import { sql, and, or, gte, lte, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { products } from "../db/schema";

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb((req as any).env);
    const search = req.query.search?.toString()?.trim() || "";

    console.log("🔍 Search request:", {
      query: req.query,
      searchTerm: search,
    });

    // If no search term, return all products
    if (!search) {
      const allProducts = await db.select().from(products);
      
      console.log("📦 Returning all products:", allProducts.length);
      
      res.json({ 
        success: true,
        count: allProducts.length,
        products: allProducts 
      });
      return;
    }

    // Search products by name (case-insensitive)
    const searchResults = await db
      .select()
      .from(products)
      .where(
        sql`lower(${products.name}) LIKE '%' || lower(${search}) || '%'`
      );

    console.log("🎯 Search results:", {
      searchTerm: search,
      resultsCount: searchResults.length,
    });

    res.json({ 
      success: true,
      count: searchResults.length,
      products: searchResults,
      searchTerm: search,
    });
  } catch (error) {
    console.error("❌ searchProducts error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error searching products" 
    });
  }
};

// Advanced search with proper conditional building
export const advancedSearchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb((req as any).env);
    const search = req.query.search?.toString()?.trim() || "";
    const category = req.query.category?.toString()?.trim();
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    console.log("🔍 Advanced search request:", {
      search,
      category,
      minPrice,
      maxPrice,
    });

    // ✅ Build all conditions upfront
    const conditions = [];

    // Search condition (name, description, brand)
    if (search) {
      conditions.push(
        sql`(
          lower(${products.name}) LIKE '%' || lower(${search}) || '%' OR
          lower(${products.description}) LIKE '%' || lower(${search}) || '%' OR
          lower(${products.brand}) LIKE '%' || lower(${search}) || '%'
        )`
      );
    }

    // Category filter
    if (category) {
      conditions.push(
        sql`lower(${products.category}) = lower(${category})`
      );
    }

    // Price range filters
    if (minPrice !== undefined) {
      conditions.push(
        sql`${products.price} >= ${minPrice}`
      );
    }

    if (maxPrice !== undefined) {
      conditions.push(
        sql`${products.price} <= ${maxPrice}`
      );
    }

    // ✅ Execute query with all conditions at once
    const results = conditions.length > 0
      ? await db
          .select()
          .from(products)
          .where(and(...conditions))
      : await db.select().from(products);

    console.log("🎯 Advanced search results:", results.length);

    res.json({ 
      success: true,
      count: results.length,
      products: results,
      filters: {
        search,
        category,
        minPrice,
        maxPrice,
      },
    });
  } catch (error) {
    console.error("❌ advancedSearchProducts error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error searching products" 
    });
  }
};