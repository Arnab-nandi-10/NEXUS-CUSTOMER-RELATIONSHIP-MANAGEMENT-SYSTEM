import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.set("trust proxy", 1)

const FRONTEND_ORIGIN = "https://nexus-customer-relationship-managem.vercel.app"

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
        FRONTEND_ORIGIN
    ])
}

const isVercelPreviewAllowed = (origin) => {
    if (process.env.CORS_ALLOW_VERCEL_PREVIEWS !== "true") {
        return false
    }

    return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
}

const isOriginAllowed = (origin) => {
    if (!origin) {
        return true
    }

    const normalizedOrigin = normalizeOrigin(origin)
    return getAllowedOrigins().has(normalizedOrigin) || isVercelPreviewAllowed(normalizedOrigin)
}

const corsMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
const corsAllowedHeaders = ["Content-Type", "Authorization"]

const corsOptions = {
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            return callback(null, true)
        }

        return callback(new Error(`CORS blocked origin: ${origin}`))
    },
    credentials: true,
    methods: corsMethods,
    allowedHeaders: corsAllowedHeaders,
    optionsSuccessStatus: 204
}

app.use((req, res, next) => {
    const origin = req.headers.origin

    if (origin && isOriginAllowed(origin)) {
        res.setHeader("Access-Control-Allow-Origin", normalizeOrigin(origin))
        res.setHeader("Access-Control-Allow-Credentials", "true")
        res.setHeader("Vary", "Origin")
    }

    res.setHeader("Access-Control-Allow-Methods", corsMethods.join(","))
    res.setHeader(
        "Access-Control-Allow-Headers",
        req.headers["access-control-request-headers"] || corsAllowedHeaders.join(",")
    )

    if (req.method === "OPTIONS") {
        return res.sendStatus(204)
    }

    next()
})

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))



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
app.use("/api/auth", authRouter)
app.use("/api/auths", authRouter)
app.use("/api/users", usersRouter)
app.use("/api/clients", clientRouter)
app.use("/api/communications", communicationRouter)
app.use("/api/reminders", reminderRouter)
app.use("/api/tasks", taskRouter)
app.use("/api/dashboard", dashboardRouter)

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", usersRouter)
app.use("/api/v1/clients", clientRouter)
app.use("/api/v1/communications", communicationRouter)
app.use("/api/v1/reminders", reminderRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// Backward-compatible routes for frontend deployments that were built with the API root URL.
app.use("/auth", authRouter)
app.use("/auths", authRouter)
app.use("/users", usersRouter)
app.use("/clients", clientRouter)
app.use("/communications", communicationRouter)
app.use("/reminders", reminderRouter)
app.use("/tasks", taskRouter)
app.use("/dashboard", dashboardRouter)

app.use((req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        availableAuthRoutes: [
            "/api/auth/register-admin",
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/google",
            "/api/auth/github",
            "/api/v1/auth/register-admin",
            "/api/v1/auth/signup",
            "/api/v1/auth/login",
            "/api/v1/auth/google",
            "/api/v1/auth/github",
            "/auth/register-admin",
            "/auth/signup",
            "/auth/login",
            "/auth/google",
            "/auth/github"
        ]
    })
})

// Global error handler - returns JSON instead of HTML
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Something went wrong"

    if (/\/auth\/(google|github)\/callback$/.test(req.path)) {
        const frontendUrl = (process.env.FRONTEND_URL || FRONTEND_ORIGIN).trim().replace(/\/$/, "")
        const redirectUrl = new URL("/login", frontendUrl)
        redirectUrl.searchParams.set("error", message)
        return res.redirect(redirectUrl.toString())
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
    })
})

export { app }
