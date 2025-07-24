import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql", // ✅ required
  dbCredentials: {
    host: "admin",
    port: 5432,
    user: "cbc_user",
    password: "yourpassword",
    database: "capture",
    ssl: true, 
  },
} satisfies Config;