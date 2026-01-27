import { Router } from "express";
import { getProducts } from "../controllers/productController";

const router = Router();

// GET /api/products?search=...
router.get("/", getProducts);

export default router;
