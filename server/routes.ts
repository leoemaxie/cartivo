import type { Express } from "express";
import { db } from "./db";
import { products } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/products", async (_req, res) => {
    try {
      const allProducts = await db.select().from(products);
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
}
