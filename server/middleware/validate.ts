// server/middleware/validate.ts
import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.errors,
      });
    }
    // Attach validated data
    (req as any).validated = result.data;
    next();
  };
}
