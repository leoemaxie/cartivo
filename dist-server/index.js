var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";
import path from "path";

// server/replit_integrations/auth/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";

// shared/models/auth.ts
import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  products: () => products,
  sessions: () => sessions,
  users: () => users
});

// shared/models/products.ts
import { pgTable as pgTable2, varchar as varchar2, real, serial } from "drizzle-orm/pg-core";
var products = pgTable2("products", {
  id: serial("id").primaryKey(),
  name: varchar2("name", { length: 255 }).notNull(),
  price: varchar2("price", { length: 50 }).notNull(),
  rating: real("rating").notNull().default(0),
  category: varchar2("category", { length: 100 }).notNull(),
  img: varchar2("img", { length: 2048 }).notNull()
});

// server/db.ts
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/replit_integrations/auth/storage.ts
import { eq } from "drizzle-orm";
var AuthStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
};
var authStorage = new AuthStorage();

// server/replit_integrations/auth/replitAuth.ts
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  const registeredStrategies = /* @__PURE__ */ new Set();
  const ensureStrategy = (domain) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/replit_integrations/auth/routes.ts
function registerAuthRoutes(app2) {
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// server/routes.ts
function registerRoutes(app2) {
  app2.get("/api/products", async (_req, res) => {
    try {
      const allProducts = await db.select().from(products);
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
}

// server/seed.ts
var DEFAULT_PRODUCTS = [
  {
    name: "Modern Minimalist Sneakers",
    price: "$129.00",
    rating: 4.8,
    category: "Recommended",
    img: "https://images.unsplash.com/photo-1543175420-34298ee94d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzbmVha2VyJTIwZGVzaWduZXIlMjBmb290d2VhciUyMG1pbmltYWxpc3QlMjB3aGl0ZSUyMHNob2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcxNTQ4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    name: "Eco-Friendly Linen Jacket",
    price: "$249.00",
    rating: 4.9,
    category: "Sustainable",
    img: "https://images.unsplash.com/photo-1759229874709-a8d0de083b91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBlY28tZnJpZW5kbHklMjBvcmdhbmljJTIwY290dG9uJTIwY2xvdGhpbmclMjBtaW5pbWFsJTIwZGVzaWduJTIwZWFydGglMjB0b25lc3xlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    name: "Smart Vision Glasses",
    price: "$399.00",
    rating: 4.7,
    category: "Trending",
    img: "https://images.unsplash.com/photo-1562330744-0e81c1e9dd88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGdsYXNzZXMlMjBhdWdtZW50ZWQlMjByZWFsaXR5JTIwdGVjaCUyMGZ1dHVyaXN0aWMlMjB3ZWFyYWJsZSUyMEFJJTIwaGVhZHNldCUyMGRlc2lnbnxlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    name: "Designer Silk Scarf",
    price: "$89.00",
    rating: 4.6,
    category: "Recommended",
    img: "https://images.unsplash.com/photo-1621536531700-cb0d34d56699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG9mJTIwc3R5bGlzaCUyMHlvdW5nJTIwd29tYW4lMjBpbiUyMHByZW1pdW0lMjBvdXRmaXQlMjBwcm9mZXNzaW9uYWwlMjBoaWdoJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MTU0ODM2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];
async function seedProducts() {
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) {
    console.log("Products already seeded, skipping...");
    return;
  }
  await db.insert(products).values(DEFAULT_PRODUCTS);
  console.log("Seeded default products");
}

// server/index.ts
var app = express();
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
  const port = isProd ? 5e3 : 3001;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}
main().catch(console.error);
