import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { Task } from "../models/task.model.js";
import { Client } from "../models/client.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// ─── Create Task ───────────────────────────────────
const createTask = asyncHandler(async (req, res) => {
    const { title, description, clientId, assignedTo, dueDate, priority } = req.body

    if (!title || title.trim() === "") {
        throw new ApiError(400, "Title is required")
    }

    if (!clientId) {
        throw new ApiError(400, "Client ID is required")
    }

    const client = await Client.findOne({ _id: clientId, isDeleted: false })
    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    // Validate assignedTo user exists if provided
    if (assignedTo) {
        const user = await User.findById(assignedTo)
        if (!user) {
            throw new ApiError(404, "Assigned user not found")
        }
    }

    if (priority && !["Low", "Medium", "High"].includes(priority)) {
        throw new ApiError(400, "Invalid priority. Must be Low, Medium, or High")
    }

    const task = await Task.create({
        title,
        description,
        clientId,
        assignedTo: assignedTo || req.user._id,
        dueDate: dueDate || null,
        priority: priority || "Medium"
    })

    const createdTask = await Task.findById(task._id)
        .populate("clientId", "fullname companyName email")
        .populate("assignedTo", "fullname email role avatar")

    return res
        .status(201)
        .json(new ApiResponse(201, createdTask, "Task created successfully"))
})


// ─── Get All Tasks (Admin) ─────────────────────────
const getAllTasks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const { status, priority, assignedTo } = req.query

    const filter = {}
    if (status && ["Pending", "Completed"].includes(status)) filter.status = status
    if (priority && ["Low", "Medium", "High"].includes(priority)) filter.priority = priority
    if (assignedTo) filter.assignedTo = assignedTo

    const [tasks, totalTasks] = await Promise.all([
        Task.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("clientId", "fullname companyName email")
            .populate("assignedTo", "fullname email role avatar"),
        Task.countDocuments(filter)
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, {
            page,
            limit,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            tasks
        }, "All tasks fetched successfully"))
})


// ─── Get My Tasks (For logged-in user) ─────────────
const getMyTasks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const { status, priority } = req.query

    const filter = { assignedTo: req.user._id }
    if (status && ["Pending", "Completed"].includes(status)) filter.status = status
    if (priority && ["Low", "Medium", "High"].includes(priority)) filter.priority = priority

    const [tasks, totalTasks] = await Promise.all([
        Task.find(filter)
            .sort({ dueDate: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("clientId", "fullname companyName email")
            .populate("assignedTo", "fullname email role avatar"),
        Task.countDocuments(filter)
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, {
            page,
            limit,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            tasks
        }, "My tasks fetched successfully"))
})


// ─── Get Tasks By Client ───────────────────────────
const getTasksByClient = asyncHandler(async (req, res) => {
    const { clientId } = req.params

    const client = await Client.findOne({ _id: clientId, isDeleted: false })
    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    // Only admin or assigned user can see tasks
    if (req.user.role !== "admin" && client.assignedTo?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

    const tasks = await Task.find({ clientId })
        .sort({ createdAt: -1 })
        .populate("assignedTo", "fullname email role avatar")

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Client tasks fetched successfully"))
})


// ─── Get Task By ID ────────────────────────────────
const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params

    const task = await Task.findById(taskId)
        .populate("clientId", "fullname companyName email phone")
        .populate("assignedTo", "fullname email role avatar")

    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    // Only admin or assigned user
    if (req.user.role !== "admin" && task.assignedTo?._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task fetched successfully"))
})


// ─── Update Task ───────────────────────────────────
const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const { title, description, dueDate, priority, assignedTo } = req.body

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    // Only admin or assigned user can update
    if (req.user.role !== "admin" && task.assignedTo?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this task")
    }

    if (priority && !["Low", "Medium", "High"].includes(priority)) {
        throw new ApiError(400, "Invalid priority")
    }

    if (assignedTo) {
        const user = await User.findById(assignedTo)
        if (!user) throw new ApiError(404, "Assigned user not found")
    }

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(dueDate !== undefined && { dueDate }),
                ...(priority && { priority }),
                ...(assignedTo && { assignedTo })
            }
        },
        { new: true, runValidators: true }
    )
        .populate("clientId", "fullname companyName email")
        .populate("assignedTo", "fullname email role avatar")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, "Task updated successfully"))
})


// ─── Toggle Task Status ────────────────────────────
const toggleTaskStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    // Only admin or assigned user can toggle
    if (req.user.role !== "admin" && task.assignedTo?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

    task.status = task.status === "Pending" ? "Completed" : "Pending"
    await task.save()

    return res
        .status(200)
        .json(new ApiResponse(200, { status: task.status }, `Task marked as ${task.status}`))
})


// ─── Delete Task ───────────────────────────────────
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    // Only admin can delete any task; assigned user can delete their own
    if (req.user.role !== "admin" && task.assignedTo?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this task")
    }

    await Task.findByIdAndDelete(taskId)

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Task deleted successfully"))
})


export {
    createTask,
    getAllTasks,
    getMyTasks,
    getTasksByClient,
    getTaskById,
    updateTask,
    toggleTaskStatus,
    deleteTask
}
