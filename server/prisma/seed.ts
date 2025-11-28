
import fs from "fs";
import path from "path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// Explicit mapping of file/model names to Prisma client properties
const modelMap: Record<string, any> = {
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

async function main() {
  const dataDir = path.join(__dirname, "seedData");

  // Delete dependent tables first
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.shippingAddress.deleteMany();
  await prisma.orderSummary.deleteMany();
  await prisma.productSummary.deleteMany();
  await prisma.sellByCategory.deleteMany();
  await prisma.sellSummary.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany(); // Users last to avoid FK issues

  const orderedFiles = [
    "category.json",
    "product.json",
    "user.json",       // Users must come before OrderSummary
    "order.json",
    "orderItem.json",
    "adminAction.json",
    "orderSummary.json",
    "productSummary.json",
    "sellByCategory.json",
    "sellSummary.json"
  ];

  for (const file of orderedFiles) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(file, path.extname(file));
    const model = modelMap[modelName];

    if (!model) {
      console.warn(`⚠️  No matching model for ${file}`);
      continue;
    }

    try {
      console.log(`🌱 Seeding ${modelName} (${data.length} records)...`);
      for (const record of data) {
        await model.create({ data: record });
      }
      console.log(`✅ Done seeding ${modelName}`);
    } catch (err) {
      console.error(`❌ Error seeding ${modelName}:`, err);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
