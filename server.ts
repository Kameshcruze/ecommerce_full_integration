import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db";
import { products } from "./src/db/schema";
import { desc, sql } from "drizzle-orm";

const app = express();
app.use(express.json());

// API Routes
app.get("/api/products", async (req, res) => {
    try {
      const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Basic auth middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const base64 = authHeader.split(' ')[1];
    if (!base64) {
      return res.status(401).json({ error: "Invalid authorization header" });
    }
    const [username, password] = Buffer.from(base64, 'base64').toString().split(':');
    if (username === 'admin' && password === 'admin1234') {
      next();
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  };

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const { name, description, price, imageUrls, isSoldOut } = req.body;
      const newProduct = await db.insert(products).values({
        name,
        description,
        price: price.toString(),
        imageUrls: imageUrls || [],
        isSoldOut: isSoldOut || false,
      }).returning();
      res.status(201).json(newProduct[0]);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, price, imageUrls, isSoldOut } = req.body;
      const updatedProduct = await db.update(products).set({
        name,
        description,
        price: price ? price.toString() : undefined,
        imageUrls,
        isSoldOut,
      }).where(sql`id = ${id}`).returning();
      
      if (updatedProduct.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(updatedProduct[0]);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deletedProduct = await db.delete(products).where(sql`id = ${id}`).returning();
      
      if (deletedProduct.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Vite middleware for development
async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
