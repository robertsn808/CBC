// server/routes/user.ts
import { Router } from "express";
import { validate } from "../middleware/validate";
import { insertUsersSchema } from "../schema/zod-crud-schemas";

const router = Router();

router.post("/users", validate(insertUsersSchema), async (req, res) => {
  const data = (req as any).validated;
  // Now safely use `data`
  res.status(200).json({ message: "User validated", data });
});

export default router;
