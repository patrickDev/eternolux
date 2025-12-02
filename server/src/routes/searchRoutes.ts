import { Router } from "express";
import { getProducts } from "../controllers/searchController";

const router = Router();

router.get("/", getProducts);

export default router;



