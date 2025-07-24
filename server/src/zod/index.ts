import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "../../vite";
import { fileURLToPath } from "url";
import path from "path";
import 'dotenv/config';
import { registerRoutes } from "../../registerRoutes";

export * from "../../schema/zod-crud-schemas";

const app = express();

// Needed for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/attached_assets', express.static('attached_assets'));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let capturedJsonResponse: any;

  const originalJson = res.json;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.json = function (body: any, ...args: any[]) {
    capturedJsonResponse = body;
    return originalJson.apply(this, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let msg = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        msg += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (msg.length > 80) msg = msg.slice(0, 79) + "…";
      log(msg);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Vite or Static
  if (app.get("env") === "development") {
    await setupVite(app, server); // Dev middleware
  } else {
    serveStatic(app); // Serve dist/public/
  }

  // Catch-all route (SPA)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  if (!process.env.VERCEL) {
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
      log(`Server running on http://localhost:${port}`);
    });
  }
})();

// Export app for Vercel (serverless)
export { app };
