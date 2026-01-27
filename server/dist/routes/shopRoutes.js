"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shopController_1 = require("../controllers/shopController");
const router = (0, express_1.Router)();
router.get("/", shopController_1.getShopData);
exports.default = router;
