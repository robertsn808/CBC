// server/registerRoutes.ts
import type { Express } from "express";

// Import individual route modules
import userRoutes from "./routes/user";
import clientRoutes from "./routes/client";
// add more as needed...

export async function registerRoutes(app: Express): Promise<Express> {
  app.use("/api/users", userRoutes);
  app.use("/api/clients", clientRoutes);
  // app.use("/api/bookings", bookingRoutes);
  // app.use("/api/invoices", invoiceRoutes);
  // ... more

  return app;
}
