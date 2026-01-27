"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = void 0;
const prisma_1 = require("../../lib/prisma");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        try {
            console.log("Request query:", req.query);
            const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || "";
            console.log("Search term:", search);
            // Show all products to confirm database content
            const all = yield prisma_1.prisma.product.findMany();
            console.log("All products in DB:", all);
            const products = yield prisma_1.prisma.product.findMany({
                where: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            });
            console.log("Search results:", products);
            res.json({ products });
        }
        catch (error) {
            console.error("Error retrieving products:", error);
            res.status(500).json({ message: "Error retrieving products" });
        }
    }
    catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.getProducts = getProducts;
