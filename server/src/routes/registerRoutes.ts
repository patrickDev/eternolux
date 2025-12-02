import { Router } from "express";
import { register } from "../controllers/registerController";

const router = Router();

//router.get("/", getProducts);

router.post('/register', register);


export default router;
