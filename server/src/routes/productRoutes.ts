// src/routes/productRoutes.ts
import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = Router();

// GET /api/products - List all or search
router.get("/", getProducts);

// GET /api/products/:id - Get single product
router.get("/:id", getProductById);

// POST /api/products - Create product
router.post("/", createProduct);

// PUT /api/products/:id - Update product
router.put("/:id", updateProduct);

// DELETE /api/products/:id - Delete product
router.delete("/:id", deleteProduct);

export default router;