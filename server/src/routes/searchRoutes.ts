// src/routes/searchRoutes.ts
import { Router } from "express";
import { searchProducts, advancedSearchProducts } from "../controllers/searchController";

const router = Router();

// Basic search
// GET /api/search?search=laptop
router.get("/", searchProducts);

// Advanced search with filters
// GET /api/search/advanced?search=laptop&category=Electronics&minPrice=500&maxPrice=2000
router.get("/advanced", advancedSearchProducts);

export default router;