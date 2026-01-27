"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signinController_1 = require("../controllers/signinController");
const router = (0, express_1.Router)();
router.post("/signin", signinController_1.signin);
exports.default = router;
