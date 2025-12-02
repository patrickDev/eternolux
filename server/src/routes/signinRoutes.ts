import { Router } from "express";
import { signin } from "../controllers/signinController";

const router = Router();


router.post("/signin", signin);

export default router;