import { Router } from "express";
import {
    createReminder,
    getAllReminders,
    getMyReminders,
    getRemindersByClient,
    getReminderById,
    updateReminder,
    markReminderSent,
    deleteReminder
} from "../controllers/reminder.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js"

const router = Router()

// All routes require authentication
router.use(verifyJWT)

// Any authenticated user
router.route("/my-reminders").get(getMyReminders)
router.route("/client/:clientId").get(getRemindersByClient)
router.route("/create").post(createReminder)
router.route("/:reminderId").get(getReminderById)
router.route("/:reminderId").patch(updateReminder)
router.route("/:reminderId/mark-sent").patch(markReminderSent)
router.route("/:reminderId").delete(deleteReminder)

// Admin-only: see all reminders
router.route("/").get(roleMiddleware("admin"), getAllReminders)


export default router