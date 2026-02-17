// src/controllers/productController.ts
import { Request, Response } from "express";
import { sql, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { products, type Product, type NewProduct } from "../db/schema";

/**
 * Generate a unique SKU
 */
const generateSKU = (name: string): string => {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 6);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate a URL-friendly slug
 */
const generateSlug = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * GET ALL PRODUCTS or SEARCH
 * Query params: ?search=...
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb((req as any).env);
    const { search } = req.query;

    // Search by name
    if (typeof search === "string" && search.trim()) {
      const rows = await db
        .select()
        .from(products)
        .where(sql`lower(${products.name}) LIKE '%' || lower(${search.trim()}) || '%'`);
      
      res.json({ 
        success: true,
        count: rows.length,
        products: rows 
      });
      return;
    }

    // List all products
    const rows = await db.select().from(products);
    
    res.json({ 
      success: true,
      count: rows.length,
      products: rows 
    });
  } catch (error) {
    console.error("❌ getProducts error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching products" 
    });
  }
};

/**
 * GET PRODUCT BY ID
 * URL Param: /api/products/:id
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb((req as any).env);
    const { id } = req.params;

    console.log("🔍 Getting product by ID:", id);

    if (!id || typeof id !== "string" || !id.trim()) {
      res.status(400).json({ 
        success: false,
        message: "Invalid product ID" 
      });
      return;
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.productId, id.trim()))
      .limit(1);

    if (!product) {
      res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
      return;
    }

    res.json({ 
      success: true,
      product 
    });
  } catch (error) {
    console.error("❌ getProductById error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching product" 
    });
  }
};

/**
 * CREATE PRODUCT
 * Body: { name, price, stock, category, sku?, description?, imageUrl?, rating?, brand?, tags?, ... }
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb((req as any).env);
    const { 
      name, 
      price, 
      stock, 
      category,
      sku,
      description, 
      imageUrl, 
      images,
      rating,
      brand,
      tags,
      originalPrice,
      costPrice,
      weight,
      dimensions,
      lowStockThreshold,
      isFeatured,
      slug,
      metaTitle,
      metaDescription,
    } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      res.status(400).json({ 
        success: false,
        message: "Product name is required" 
      });
      return;
    }

    if (!category || category.trim() === "") {
      res.status(400).json({ 
        success: false,
        message: "Product category is required" 
      });
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      res.status(400).json({ 
        success: false,
        message: "Valid price is required" 
      });
      return;
    }

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      res.status(400).json({ 
        success: false,
        message: "Valid stock quantity is required" 
      });
      return;
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 0 || numRating > 5) {
        res.status(400).json({ 
          success: false,
          message: "Rating must be between 0 and 5" 
        });
        return;
      }
    }

    // Generate SKU if not provided
    const productSku = sku?.trim() || generateSKU(name);
    
    // Generate slug if not provided
    const productSlug = slug?.trim() || generateSlug(name);

    // Build product data with all fields
    const productData: NewProduct = {
      name: name.trim(),
      sku: productSku,
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      
      // Optional fields
      description: description?.trim() || null,
      brand: brand?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      images: images || null,
      tags: tags || null,
      rating: rating ? Number(rating) : null,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      costPrice: costPrice ? Number(costPrice) : null,
      weight: weight ? Number(weight) : null,
      dimensions: dimensions || null,
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 10,
      isFeatured: isFeatured === true,
      slug: productSlug,
      metaTitle: metaTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
    };

    const [newProduct] = await db
      .insert(products)
      .values(productData)
      .returning();

    console.log("✅ Product created:", newProduct.productId);

    res.status(201).json({ 
      success: true,
      message: "Product created successfully", 
      product: newProduct 
    });
  } catch (error) {
    console.error("❌ createProduct error:", error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      res.status(409).json({ 
        success: false,
        message: "Product with this SKU or slug already exists" 
      });
      return;
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error creating product" 
    });
  }
};

/**
 * UPDATE PRODUCT
 * URL Param: /api/products/:id
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb((req as any).env);
    const { id } = req.params;
    const { 
      name, 
      price, 
      stock, 
      category,
      sku,
      description, 
      imageUrl,
      images, 
      rating,
      brand,
      tags,
      originalPrice,
      costPrice,
      weight,
      dimensions,
      lowStockThreshold,
      status,
      isFeatured,
      slug,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!id || typeof id !== "string" || !id.trim()) {
      res.status(400).json({ 
        success: false,
        message: "Invalid product ID" 
      });
      return;
    }

    // Build update object with only provided fields
    const updateData: Partial<NewProduct> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        res.status(400).json({ 
          success: false,
          message: "Product name cannot be empty" 
        });
        return;
      }
      updateData.name = name.trim();
    }

    if (sku !== undefined) {
      if (typeof sku !== "string" || sku.trim() === "") {
        res.status(400).json({ 
          success: false,
          message: "SKU cannot be empty" 
        });
        return;
      }
      updateData.sku = sku.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || category.trim() === "") {
        res.status(400).json({ 
          success: false,
          message: "Category cannot be empty" 
        });
        return;
      }
      updateData.category = category.trim();
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        res.status(400).json({ 
          success: false,
          message: "Invalid price value" 
        });
        return;
      }
      updateData.price = numPrice;
    }

    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0) {
        res.status(400).json({ 
          success: false,
          message: "Invalid stock value" 
        });
        return;
      }
      updateData.stock = numStock;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (brand !== undefined) {
      updateData.brand = brand?.trim() || null;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl?.trim() || null;
    }

    if (images !== undefined) {
      updateData.images = images;
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    if (rating !== undefined) {
      if (rating === null) {
        updateData.rating = null;
      } else {
        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 0 || numRating > 5) {
          res.status(400).json({ 
            success: false,
            message: "Rating must be between 0 and 5" 
          });
          return;
        }
        updateData.rating = numRating;
      }
    }

    if (originalPrice !== undefined) {
      updateData.originalPrice = originalPrice ? Number(originalPrice) : null;
    }

    if (costPrice !== undefined) {
      updateData.costPrice = costPrice ? Number(costPrice) : null;
    }

    if (weight !== undefined) {
      updateData.weight = weight ? Number(weight) : null;
    }

    if (dimensions !== undefined) {
      updateData.dimensions = dimensions;
    }

    if (lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = Number(lowStockThreshold);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured === true;
    }

    if (slug !== undefined) {
      updateData.slug = slug?.trim() || null;
    }

    if (metaTitle !== undefined) {
      updateData.metaTitle = metaTitle?.trim() || null;
    }

    if (metaDescription !== undefined) {
      updateData.metaDescription = metaDescription?.trim() || null;
    }

    // Always update updatedAt
    updateData.updatedAt = sql`CURRENT_TIMESTAMP` as any;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ 
        success: false,
        message: "No valid fields to update" 
      });
      return;
    }

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.productId, id.trim()))
      .returning();

    if (!updatedProduct) {
      res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
      return;
    }

    console.log("✅ Product updated:", updatedProduct.productId);

    res.json({ 
      success: true,
      message: "Product updated successfully", 
      product: updatedProduct 
    });
  } catch (error) {
    console.error("❌ updateProduct error:", error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      res.status(409).json({ 
        success: false,
        message: "Product with this SKU or slug already exists" 
      });
      return;
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error updating product" 
    });
  }
};

/**
 * DELETE PRODUCT
 * URL Param: /api/products/:id
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb((req as any).env);
    const { id } = req.params;

    if (!id || typeof id !== "string" || !id.trim()) {
      res.status(400).json({ 
        success: false,
        message: "Invalid product ID" 
      });
      return;
    }

    const result = await db
      .delete(products)
      .where(eq(products.productId, id.trim()))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
      return;
    }

    console.log("✅ Product deleted:", id);

    res.json({ 
      success: true,
      message: "Product deleted successfully" 
    });
  } catch (error) {
    console.error("❌ deleteProduct error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error deleting product" 
    });
  }
};