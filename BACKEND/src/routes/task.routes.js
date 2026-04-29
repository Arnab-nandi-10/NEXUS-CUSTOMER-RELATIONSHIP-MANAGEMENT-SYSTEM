import { Router } from "express";
import {
    createTask,
    getAllTasks,
    getMyTasks,
    getTasksByClient,
    getTaskById,
    updateTask,
    toggleTaskStatus,
    deleteTask
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router()

// All routes require authentication
router.use(verifyJWT)

// Admin-only: see all tasks (must be before /:taskId)
router.route("/all").get(roleMiddleware("admin"), getAllTasks)

// Any authenticated user
router.route("/my-tasks").get(getMyTasks)
router.route("/client/:clientId").get(getTasksByClient)

// Admin + Sales can create tasks
router.route("/create").post(roleMiddleware("admin", "sales"), createTask)

// Task by ID operations
router.route("/:taskId").get(getTaskById)
router.route("/:taskId").patch(roleMiddleware("admin", "sales"), updateTask)
router.route("/:taskId").delete(roleMiddleware("admin", "sales"), deleteTask)
router.route("/:taskId/toggle-status").patch(toggleTaskStatus)

export default router
