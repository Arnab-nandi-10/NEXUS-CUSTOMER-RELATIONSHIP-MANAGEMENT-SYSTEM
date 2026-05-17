import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.set("trust proxy", 1)

const normalizeOrigin = (origin) => origin?.trim().replace(/\/$/, "")

const getAllowedOrigins = () => {
    const configuredOrigins = [
        process.env.CORS_ORIGIN,
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL
    ]
        .filter(Boolean)
        .flatMap((origins) => origins.split(","))
        .map(normalizeOrigin)
        .filter(Boolean)

    return new Set([
        ...configuredOrigins,
        "https://nexus-customer-relationship-managem.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ])
}

const isVercelPreviewAllowed = (origin) => {
    if (process.env.CORS_ALLOW_VERCEL_PREVIEWS !== "true") {
        return false
    }

    return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true)
        }

        const normalizedOrigin = normalizeOrigin(origin)
        if (getAllowedOrigins().has(normalizedOrigin) || isVercelPreviewAllowed(normalizedOrigin)) {
            return callback(null, true)
        }

        return callback(new Error(`CORS blocked origin: ${origin}`))
    },
    credentials: true
}))



app.use(express.json({limit : "16kb"}))
app.use(urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

const sendApiStatus = (_, res) => {
    res.status(200).json({
        success: true,
        message: "Nexus CRM API is running",
        health: "/health",
        api: "/api/v1"
    })
}

app.head("/", (_, res) => res.sendStatus(200))
app.get("/", sendApiStatus)

app.get("/health", (_, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    })
})



// router import
import authRouter from "./routes/auth.routes.js"
import usersRouter from "./routes/user.routes.js"
import clientRouter from "./routes/client.routes.js"
import communicationRouter from "./routes/communication.routes.js"
import reminderRouter from "./routes/reminder.routes.js"
import taskRouter from "./routes/task.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// route declaretion
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", usersRouter)
app.use("/api/v1/clients", clientRouter)
app.use("/api/v1/communications", communicationRouter)
app.use("/api/v1/reminders", reminderRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// Backward-compatible routes for frontend deployments that were built with the API root URL.
app.use("/auth", authRouter)
app.use("/users", usersRouter)
app.use("/clients", clientRouter)
app.use("/communications", communicationRouter)
app.use("/reminders", reminderRouter)
app.use("/tasks", taskRouter)
app.use("/dashboard", dashboardRouter)

// Global error handler - returns JSON instead of HTML
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Something went wrong"

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
    })
})

export { app }
