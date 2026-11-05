import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "WorkLedger API is running",
  });
});

router.use("/auth", authRoutes);

// Any authenticated user
router.get(
  "/test/auth",
  authenticate,
  (_req, res) => {
    res.json({ message: "Authentication successful" });
  }
);

// Super admin only
router.get(
  "/test/super-admin",
  authenticate,
  authorize("SUPER_ADMIN"),
  (_req, res) => {
    res.json({ message: "Super admin access granted" });
  }
);

// Sub-admin and super-admin
router.get(
  "/test/admin",
  authenticate,
  authorize("SUPER_ADMIN", "SUB_ADMIN"),
  (_req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

export default router;