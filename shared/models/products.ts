import { pgTable, varchar, numeric, real, serial } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  rating: real("rating").notNull().default(0),
  category: varchar("category", { length: 100 }).notNull(),
  img: varchar("img", { length: 2048 }).notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
