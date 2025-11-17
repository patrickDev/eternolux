import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.join(__dirname, "seedData");

  const orderedFiles = [
    "category.json",
    "product.json",
    "user.json",
    "order.json",
    "orderItem.json",
    "adminActions.json",
    "orderSummary.json",
    "productSummary.json",
    "sellByCategory.json",
    "sellSummary.json",
  ];

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
