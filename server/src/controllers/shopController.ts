import {prisma}  from "../lib/prisma";
import { Request, Response } from "express";

export const getShopData = async (req: Request, res: Response): Promise<void> => {
  try {
    const popularProducts = await prisma.product.findMany({
      take: 15,
      orderBy: { stock: "desc" },
    });

    res.json({ popularProducts });
  } catch (error) {
    console.error("Error retrieving shop metrics:", error);
    res.status(500).json({ message: "Error retrieving shop metrics" });
  }
};





