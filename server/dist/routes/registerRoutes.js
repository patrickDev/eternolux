"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registerController_1 = require("../controllers/registerController");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post("/register", registerController_1.registerController);
exports.default = router;
//# sourceMappingURL=registerRoutes.js.map