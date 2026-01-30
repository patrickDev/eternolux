import { Router } from "express";
import { getProducts } from "../controllers/productController";

const router = Router();

// GET /api/products
// GET /api/products?search=term
// GET /api/products?productId=<uuid>
router.get("/", getProducts);

export default router;
