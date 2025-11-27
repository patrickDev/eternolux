import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

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
  await prisma.user.deleteMany(); // now safe

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

  // 2️⃣ Seeding loop
  for (const file of orderedFiles) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(file, path.extname(file));
    const model = (prisma as any)[
      modelName.charAt(0).toLowerCase() + modelName.slice(1)
    ];

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
