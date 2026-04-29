import { ApiResponse } from "../utils/ApiResponce.js";
import { Client } from "../models/client.model.js";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { Communication } from "../models/communication.model.js";
import { Reminder } from "../models/reminder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// ─── Admin Dashboard Stats ─────────────────────────
const getAdminDashboard = asyncHandler(async (req, res) => {
    const [
        totalClients,
        totalActiveClients,
        totalUsers,
        totalSalesUsers,
        totalSupportUsers,
        totalTasks,
        pendingTasks,
        completedTasks,
        totalCommunications,
        totalReminders,
        pendingReminders,
        leadBreakdown,
        recentClients,
        recentTasks,
        overdueTasks
    ] = await Promise.all([
        Client.countDocuments({ isDeleted: false }),
        Client.countDocuments({ isDeleted: false, leadStatus: { $ne: "Lost" } }),
        User.countDocuments({ role: { $ne: "admin" } }),
        User.countDocuments({ role: "sales" }),
        User.countDocuments({ role: "support" }),
        Task.countDocuments(),
        Task.countDocuments({ status: "Pending" }),
        Task.countDocuments({ status: "Completed" }),
        Communication.countDocuments(),
        Reminder.countDocuments(),
        Reminder.countDocuments({ status: "PENDING" }),
        Client.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$leadStatus", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        Client.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("assignedTo", "fullname email role avatar")
            .populate("createdBy", "fullname email role avatar"),
        Task.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("clientId", "fullname companyName")
            .populate("assignedTo", "fullname email role avatar"),
        Task.find({
            status: "Pending",
            dueDate: { $lt: new Date() }
        })
            .sort({ dueDate: 1 })
            .limit(10)
            .populate("clientId", "fullname companyName")
            .populate("assignedTo", "fullname email role avatar")
    ])

    return res.status(200).json(new ApiResponse(200, {
        stats: {
            clients: {
                total: totalClients,
                active: totalActiveClients
            },
            users: {
                total: totalUsers,
                sales: totalSalesUsers,
                support: totalSupportUsers
            },
            tasks: {
                total: totalTasks,
                pending: pendingTasks,
                completed: completedTasks,
                overdue: overdueTasks.length
            },
            communications: totalCommunications,
            reminders: {
                total: totalReminders,
                pending: pendingReminders
            }
        },
        leadBreakdown,
        recentClients,
        recentTasks,
        overdueTasks
    }, "Admin dashboard fetched successfully"))
})


// ─── Sales Dashboard ───────────────────────────────
const getSalesDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const [
        myClients,
        myNewLeads,
        myInProgressLeads,
        myConvertedLeads,
        myTasks,
        myPendingTasks,
        myCompletedTasks,
        myCommunications,
        myReminders,
        recentClients,
        upcomingTasks,
        myOverdueTasks
    ] = await Promise.all([
        Client.countDocuments({ assignedTo: userId, isDeleted: false }),
        Client.countDocuments({ assignedTo: userId, isDeleted: false, leadStatus: "New" }),
        Client.countDocuments({ assignedTo: userId, isDeleted: false, leadStatus: "In Progress" }),
        Client.countDocuments({ assignedTo: userId, isDeleted: false, leadStatus: "Converted" }),
        Task.countDocuments({ assignedTo: userId }),
        Task.countDocuments({ assignedTo: userId, status: "Pending" }),
        Task.countDocuments({ assignedTo: userId, status: "Completed" }),
        Communication.countDocuments({ sentBy: userId }),
        Reminder.countDocuments({ createdBy: userId, status: "PENDING" }),
        Client.find({ assignedTo: userId, isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("createdBy", "fullname email role avatar"),
        Task.find({ assignedTo: userId, status: "Pending" })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate("clientId", "fullname companyName"),
        Task.find({
            assignedTo: userId,
            status: "Pending",
            dueDate: { $lt: new Date() }
        })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate("clientId", "fullname companyName")
    ])

    return res.status(200).json(new ApiResponse(200, {
        stats: {
            clients: {
                total: myClients,
                newLeads: myNewLeads,
                inProgress: myInProgressLeads,
                converted: myConvertedLeads
            },
            tasks: {
                total: myTasks,
                pending: myPendingTasks,
                completed: myCompletedTasks,
                overdue: myOverdueTasks.length
            },
            communications: myCommunications,
            pendingReminders: myReminders
        },
        recentClients,
        upcomingTasks,
        overdueTasks: myOverdueTasks
    }, "Sales dashboard fetched successfully"))
})


// ─── Support Dashboard ─────────────────────────────
const getSupportDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const [
        myClients,
        myTasks,
        myPendingTasks,
        myCompletedTasks,
        myCommunications,
        myReminders,
        recentClients,
        upcomingTasks
    ] = await Promise.all([
        Client.countDocuments({ assignedTo: userId, isDeleted: false }),
        Task.countDocuments({ assignedTo: userId }),
        Task.countDocuments({ assignedTo: userId, status: "Pending" }),
        Task.countDocuments({ assignedTo: userId, status: "Completed" }),
        Communication.countDocuments({ sentBy: userId }),
        Reminder.countDocuments({ createdBy: userId, status: "PENDING" }),
        Client.find({ assignedTo: userId, isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("createdBy", "fullname email role avatar"),
        Task.find({ assignedTo: userId, status: "Pending" })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate("clientId", "fullname companyName")
    ])

    return res.status(200).json(new ApiResponse(200, {
        stats: {
            clients: myClients,
            tasks: {
                total: myTasks,
                pending: myPendingTasks,
                completed: myCompletedTasks
            },
            communications: myCommunications,
            pendingReminders: myReminders
        },
        recentClients,
        upcomingTasks
    }, "Support dashboard fetched successfully"))
})


// ─── Analytics (Admin) ─────────────────────────────
const getAnalytics = asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
        clientsByMonth,
        taskCompletionRate,
        communicationsByType,
        topSalesUsers,
        leadConversionFunnel
    ] = await Promise.all([
        // Clients created per month (last 6 months)
        Client.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]),

        // Task completion rate
        Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),

        // Communications by type
        Communication.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]),

        // Top 5 sales users by converted leads
        Client.aggregate([
            { $match: { leadStatus: "Converted", isDeleted: false } },
            { $group: { _id: "$assignedTo", convertedCount: { $sum: 1 } } },
            { $sort: { convertedCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        { $project: { fullname: 1, email: 1, avatar: 1, role: 1 } }
                    ]
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }
        ]),

        // Lead funnel
        Client.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: "$leadStatus",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ])
    ])

    return res.status(200).json(new ApiResponse(200, {
        clientsByMonth,
        taskCompletionRate,
        communicationsByType,
        topSalesUsers,
        leadConversionFunnel
    }, "Analytics fetched successfully"))
})


export {
    getAdminDashboard,
    getSalesDashboard,
    getSupportDashboard,
    getAnalytics
}
