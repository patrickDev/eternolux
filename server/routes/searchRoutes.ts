import { Router } from "express";
import { getProducts } from "../src/controllers/searchController";

const router = Router();

router.get("/products", getProducts);

export default router;
