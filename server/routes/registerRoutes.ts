import { Router } from "express";
import { register } from "../src/controllers/registerController";

const router = Router();

//router.get("/", getProducts);

router.post('/register', register);


export default router;
