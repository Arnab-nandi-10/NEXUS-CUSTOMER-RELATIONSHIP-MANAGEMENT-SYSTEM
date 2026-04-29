import { Router } from "express";
import {
    getAdminDashboard,
    getSalesDashboard,
    getSupportDashboard,
    getAnalytics
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router()

// All routes require authentication
router.use(verifyJWT)

// Role-based dashboards
router.route("/admin").get(roleMiddleware("admin"), getAdminDashboard)
router.route("/sales").get(roleMiddleware("admin", "sales"), getSalesDashboard)
router.route("/support").get(roleMiddleware("admin", "support"), getSupportDashboard)

// Analytics (admin only)
router.route("/analytics").get(roleMiddleware("admin"), getAnalytics)

export default router
