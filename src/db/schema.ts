import { pgTable, serial, text, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  imageUrls: text("image_urls").array().notNull().default(sql`ARRAY[]::text[]`),
  isSoldOut: boolean("is_sold_out").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
