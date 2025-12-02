import { Router} from "express";
import { getShopData } from "../controllers/shopController";

const router = Router();


router.get("/", getShopData);

export default router;