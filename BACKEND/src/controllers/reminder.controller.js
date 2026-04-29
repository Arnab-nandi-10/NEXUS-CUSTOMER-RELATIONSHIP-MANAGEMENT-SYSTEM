import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { Client } from "../models/client.model.js"
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Reminder } from "../models/reminder.model.js";


const createReminder = asyncHandler(async (req, res) => {
    const { clientId, channel, subject, message, remindAt, status } = req.body

    if (
        [clientId, channel, message, remindAt].some((field) => field.toString().trim() === "")
    ) {
        throw new ApiError(400, "All required fields must be provided")
    }

    if (
        !["Email", "SMS"].includes(channel)
    ) {
        throw new ApiError(400, "Invalid channel")
    }

    if (channel === "Email") {
        if (!subject) {
            throw new ApiError(400, "Subject required for email")
        }
    }

    if (status) {
        if (
            !["PENDING", "SENT"].includes(status)
        ) {
            throw new ApiError(400, "Invalid status")
        }
    }

    const client = await Client.findOne({
        _id: clientId,
        isDeleted: false
    })

    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    if (!(req.user._id.toString() === client.assignedTo?.toString() || req.user.role === "admin")) {
        throw new ApiError(403, "Access denied")
    }

    const reminder = await Reminder.create({
        clientId,
        channel,
        subject,
        message,
        remindAt,
        status,
        createdBy: req.user._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, reminder, "Reminder created successfully")
        )
})


// ─── Get All Reminders (Admin) ─────────────────────
const getAllReminders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const { status, channel } = req.query
    const filter = {}
    if (status && ["PENDING", "SENT"].includes(status)) filter.status = status
    if (channel && ["Email", "SMS"].includes(channel)) filter.channel = channel

    const [reminders, totalReminders] = await Promise.all([
        Reminder.find(filter)
            .sort({ remindAt: 1 })
            .skip(skip)
            .limit(limit)
            .populate("clientId", "fullname companyName email")
            .populate("createdBy", "fullname email role avatar"),
        Reminder.countDocuments(filter)
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, {
            page,
            limit,
            totalReminders,
            totalPages: Math.ceil(totalReminders / limit),
            reminders
        }, "All reminders fetched successfully"))
})


// ─── Get My Reminders ──────────────────────────────
const getMyReminders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const { status } = req.query
    const filter = { createdBy: req.user._id }
    if (status && ["PENDING", "SENT"].includes(status)) filter.status = status

    const [reminders, totalReminders] = await Promise.all([
        Reminder.find(filter)
            .sort({ remindAt: 1 })
            .skip(skip)
            .limit(limit)
            .populate("clientId", "fullname companyName email"),
        Reminder.countDocuments(filter)
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, {
            page,
            limit,
            totalReminders,
            totalPages: Math.ceil(totalReminders / limit),
            reminders
        }, "My reminders fetched successfully"))
})


// ─── Get Reminders By Client ───────────────────────
const getRemindersByClient = asyncHandler(async (req, res) => {
    const { clientId } = req.params

    const client = await Client.findOne({ _id: clientId, isDeleted: false })
    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    if (req.user.role !== "admin" && client.assignedTo?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

    const reminders = await Reminder.find({ clientId })
        .sort({ remindAt: 1 })
        .populate("createdBy", "fullname email role avatar")

    return res
        .status(200)
        .json(new ApiResponse(200, reminders, "Client reminders fetched successfully"))
})


// ─── Get Reminder By ID ────────────────────────────
const getReminderById = asyncHandler(async (req, res) => {
    const { reminderId } = req.params

    const reminder = await Reminder.findById(reminderId)
        .populate("clientId", "fullname companyName email phone")
        .populate("createdBy", "fullname email role avatar")

    if (!reminder) {
        throw new ApiError(404, "Reminder not found")
    }

    if (req.user.role !== "admin" && reminder.createdBy?._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, reminder, "Reminder fetched successfully"))
})


// ─── Update Reminder ───────────────────────────────
const updateReminder = asyncHandler(async (req, res) => {
    const { reminderId } = req.params
    const { channel, subject, message, remindAt } = req.body

    const reminder = await Reminder.findById(reminderId)
    if (!reminder) {
        throw new ApiError(404, "Reminder not found")
    }

    if (reminder.status === "SENT") {
        throw new ApiError(400, "Cannot update a sent reminder")
    }

    if (req.user.role !== "admin" && reminder.createdBy?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

    if (channel && !["Email", "SMS"].includes(channel)) {
        throw new ApiError(400, "Invalid channel")
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(
        reminderId,
        {
            $set: {
                ...(channel && { channel }),
                ...(subject !== undefined && { subject }),
                ...(message && { message }),
                ...(remindAt && { remindAt })
            }
        },
        { new: true }
    )
        .populate("clientId", "fullname companyName email")
        .populate("createdBy", "fullname email role avatar")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedReminder, "Reminder updated successfully"))
})


// ─── Mark Reminder as Sent ─────────────────────────
const markReminderSent = asyncHandler(async (req, res) => {
    const { reminderId } = req.params

    const reminder = await Reminder.findById(reminderId)
    if (!reminder) {
        throw new ApiError(404, "Reminder not found")
    }

    if (req.user.role !== "admin" && reminder.createdBy?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

    reminder.status = "SENT"
    await reminder.save()

    return res
        .status(200)
        .json(new ApiResponse(200, { status: reminder.status }, "Reminder marked as sent"))
})


// ─── Delete Reminder ───────────────────────────────
const deleteReminder = asyncHandler(async (req, res) => {
    const { reminderId } = req.params

    const reminder = await Reminder.findById(reminderId)
    if (!reminder) {
        throw new ApiError(404, "Reminder not found")
    }

    if (req.user.role !== "admin" && reminder.createdBy?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

    await Reminder.findByIdAndDelete(reminderId)

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Reminder deleted successfully"))
})


export {
    createReminder,
    getAllReminders,
    getMyReminders,
    getRemindersByClient,
    getReminderById,
    updateReminder,
    markReminderSent,
    deleteReminder
}