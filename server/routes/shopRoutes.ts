import { Router } from "express";
import { getShopData } from "../src/controllers/shopController";

const router = Router();


router.get("/", getShopData);

export default router;