
import { Router } from "express";

import { login } from "./auth.controller";
import { loginSchema } from "./auth.validation";
import { validate } from "../../middleware/validate.middleware";

const router = Router();

router.post(
  "/login",
  validate({ body: loginSchema }),
  login
);

export default router;
