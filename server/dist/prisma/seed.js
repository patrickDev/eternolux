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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Use dynamic require to avoid TypeScript import resolution issues with v7
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
// Explicit mapping of file/model names to Prisma client properties
const modelMap = {
    category: prisma.category,
    product: prisma.product,
    user: prisma.user,
    order: prisma.order,
    orderItem: prisma.orderItem,
    adminAction: prisma.adminAction,
    orderSummary: prisma.orderSummary,
    productSummary: prisma.productSummary,
    sellByCategory: prisma.sellByCategory,
    sellSummary: prisma.sellSummary,
    productCategory: prisma.productCategory,
    cart: prisma.cart,
    cartItem: prisma.cartItem,
    shippingAddress: prisma.shippingAddress
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDir = path_1.default.join(__dirname, "seedData");
        const orderedFiles = [
            "category.json",
            "product.json",
            "user.json",
            "order.json",
            "orderItem.json",
            "adminAction.json",
            "orderSummary.json",
            "productSummary.json",
            "sellByCategory.json",
            "sellSummary.json"
        ];
        for (const file of orderedFiles) {
            const filePath = path_1.default.join(dataDir, file);
            if (!fs_1.default.existsSync(filePath)) {
                console.warn(`⚠️  File not found: ${file}`);
                continue;
            }
            const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            const modelName = path_1.default.basename(file, path_1.default.extname(file));
            const model = modelMap[modelName];
            if (!model) {
                console.warn(`⚠️  No matching model for ${file}`);
                continue;
            }
            try {
                console.log(`🌱 Seeding ${modelName} (${data.length} records)...`);
                for (const record of data) {
                    yield model.create({ data: record });
                }
                console.log(`✅ Done seeding ${modelName}`);
            }
            catch (err) {
                console.error(`❌ Error seeding ${modelName}:`, err);
            }
        }
    });
}
main()
    .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
