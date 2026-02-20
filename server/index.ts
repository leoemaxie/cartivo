import express from "express";
import path from "path";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerRoutes } from "./routes";
import { seedProducts } from "./seed";

const app = express();
app.use(express.json());

async function main() {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerRoutes(app);

  await seedProducts();

  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const distPath = path.resolve(import.meta.dirname, "../dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = isProd ? 5000 : 3001;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch(console.error);
