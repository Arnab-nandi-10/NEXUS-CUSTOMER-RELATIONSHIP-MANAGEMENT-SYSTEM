import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production"

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    }
}

const getOAuthStateCookieOptions = () => ({
    ...getCookieOptions(),
    maxAge: 10 * 60 * 1000
})

const getFrontendUrl = () => {
    const origin = process.env.FRONTEND_URL || process.env.CORS_ORIGIN?.split(",")[0]
    return (origin || "http://localhost:3000").trim().replace(/\/$/, "")
}

const getBackendUrl = (req) => {
    const configuredUrl = process.env.BACKEND_URL || process.env.API_BASE_URL
    if (configuredUrl) {
        return configuredUrl.trim().replace(/\/$/, "")
    }

    return `${req.protocol}://${req.get("host")}`
}

const getCallbackUrl = (provider, req) => {
    const envKey = `${provider.toUpperCase()}_CALLBACK_URL`
    return process.env[envKey] || `${getBackendUrl(req)}/api/auth/${provider}/callback`
}

const buildRedirectUrl = (path, params = {}) => {
    const url = new URL(path, getFrontendUrl())
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value))
        }
    })
    return url.toString()
}

const redirectOAuthError = (res, message) => {
    return res.redirect(buildRedirectUrl("/login", { error: message }))
}

const encodeOAuthUser = (user) => Buffer.from(JSON.stringify({
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    avatar: user.avatar
})).toString("base64url")

const redirectOAuthSuccess = (res, user, accessToken, provider) => {
    const hash = new URLSearchParams({
        accessToken,
        provider,
        user: encodeOAuthUser(user)
    }).toString()

    return res.redirect(`${getFrontendUrl()}/oauth/callback#${hash}`)
}

const requestJson = async (url, options, fallbackMessage) => {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new ApiError(response.status, data.error_description || data.message || data.error || fallbackMessage)
    }

    return data
}

const createOAuthState = (res, provider) => {
    const state = crypto.randomBytes(24).toString("hex")
    res.cookie(`oauth_${provider}_state`, state, getOAuthStateCookieOptions())
    return state
}

const verifyOAuthState = (req, res, provider) => {
    const expectedState = req.cookies?.[`oauth_${provider}_state`]
    res.clearCookie(`oauth_${provider}_state`, getOAuthStateCookieOptions())

    if (!expectedState || expectedState !== req.query.state) {
        throw new ApiError(400, "OAuth session expired. Please try again.")
    }
}

const findOrCreateOAuthUser = async ({ provider, providerId, email, fullname, avatar }) => {
    if (!email) {
        throw new ApiError(400, "OAuth provider did not return a verified email address")
    }

    const providerIdField = provider === "google" ? "googleId" : "githubId"
    let user = await User.findOne({ [providerIdField]: providerId })

    if (!user) {
        user = await User.findOne({ email })
    }

    if (user) {
        if (!user.isActive) {
            throw new ApiError(403, "Your account is deactivated. Contact admin.")
        }

        user[providerIdField] = providerId
        if (!user.avatar && avatar) user.avatar = avatar
        if (!user.authProvider || user.authProvider === "local") user.authProvider = provider
        await user.save({ validateBeforeSave: false })
        return user
    }

    const adminExists = await User.exists({ role: "admin" })
    return await User.create({
        fullname,
        email,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=random&color=fff`,
        role: adminExists ? "sales" : "admin",
        authProvider: provider,
        [providerIdField]: providerId,
        password: crypto.randomBytes(32).toString("hex")
    })
}

const getDefaultAvatar = (fullname) => `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=random&color=fff`

const getUploadAvatar = async (filePath, fullname) => {
    let avatarLocalPath = ""

    if (filePath) {
        const avatar = await uploadOnCloudinary(filePath)
        avatarLocalPath = avatar?.url || ""
    }

    return avatarLocalPath || getDefaultAvatar(fullname)
}

const getPublicSignupRole = async () => {
    const adminExists = await User.exists({ role: "admin" })
    return adminExists ? "sales" : "admin"
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {

    const { email, fullname, role, password } = req.body
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
    const normalizedFullname = typeof fullname === "string" ? fullname.trim() : ""
    const normalizedRole = typeof role === "string" ? role.trim() : ""
    const normalizedPassword = typeof password === "string" ? password : ""

    
    if (![normalizedEmail, normalizedFullname, normalizedRole, normalizedPassword].every((field) => field !== "")) {
        throw new ApiError(400, "All fields are required")
    }

    const allowedRoles = ["admin", "sales", "support"]

    if (!allowedRoles.includes(normalizedRole)) {
        throw new ApiError(400, "Invalid role")
    }

    const existedUser = await User.findOne({ email: normalizedEmail })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const avatarLocalPath = await getUploadAvatar(req.file?.path, normalizedFullname)

    const user = await User.create({
        fullname: normalizedFullname,
        avatar: avatarLocalPath,
        email: normalizedEmail,
        role: normalizedRole,
        password: normalizedPassword
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )
})

const registerPublicUser = asyncHandler(async (req, res) => {
    const { email, fullname, password } = req.body
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
    const normalizedFullname = typeof fullname === "string" ? fullname.trim() : ""
    const normalizedPassword = typeof password === "string" ? password : ""

    if (![normalizedEmail, normalizedFullname, normalizedPassword].every((field) => field !== "")) {
        throw new ApiError(400, "Full name, email and password are required")
    }

    if (normalizedPassword.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters")
    }

    const existedUser = await User.findOne({ email: normalizedEmail })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const avatarLocalPath = await getUploadAvatar(req.file?.path, normalizedFullname)
    const role = await getPublicSignupRole()

    const user = await User.create({
        fullname: normalizedFullname,
        avatar: avatarLocalPath,
        email: normalizedEmail,
        role,
        password: normalizedPassword
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered successfully")
        )
})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body


    if (!email || !password) {
        throw new ApiError(400, "Email and password is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account is deactivated. Contact admin.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")


    return res
        .status(200)
        .cookie("accessToken", accessToken, getCookieOptions())
        .cookie("refreshToken", refreshToken, getCookieOptions())
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true // for this one, this method returns the new updated data
        }
    )


    res
        .status(200)
        .clearCookie("accessToken", getCookieOptions())
        .clearCookie("refreshToken", getCookieOptions())
        .json(new ApiResponse(200, {}, "User Logged Out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefrshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefrshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefrshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefrshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, getCookieOptions())
            .cookie("refreshToken", refreshToken, getCookieOptions())
            .json(
                new ApiResponse(200,
                {
                    accessToken, refreshToken
                },
                "Access token refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const startGoogleOAuth = asyncHandler(async (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new ApiError(500, "Google OAuth is not configured")
    }

    const state = createOAuthState(res, "google")
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", getCallbackUrl("google", req))
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "openid email profile")
    authUrl.searchParams.set("state", state)
    authUrl.searchParams.set("prompt", "select_account")

    return res.redirect(authUrl.toString())
})

const handleGoogleOAuthCallback = asyncHandler(async (req, res) => {
    const { code } = req.query
    if (!code) {
        return redirectOAuthError(res, "Google sign-in was cancelled")
    }

    verifyOAuthState(req, res, "google")

    const tokenData = await requestJson("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: getCallbackUrl("google", req),
            grant_type: "authorization_code"
        })
    }, "Failed to complete Google sign-in")

    if (!tokenData.access_token) {
        throw new ApiError(400, tokenData.error_description || "Google did not return an access token")
    }

    const profile = await requestJson("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
    }, "Failed to load Google profile")

    if (!profile.email_verified) {
        throw new ApiError(403, "Google email address is not verified")
    }

    const user = await findOrCreateOAuthUser({
        provider: "google",
        providerId: profile.sub,
        email: profile.email,
        fullname: profile.name || profile.email.split("@")[0],
        avatar: profile.picture
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    res
        .cookie("accessToken", accessToken, getCookieOptions())
        .cookie("refreshToken", refreshToken, getCookieOptions())

    return redirectOAuthSuccess(res, loggedInUser, accessToken, "google")
})

const startGithubOAuth = asyncHandler(async (req, res) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        throw new ApiError(500, "GitHub OAuth is not configured")
    }

    const state = createOAuthState(res, "github")
    const authUrl = new URL("https://github.com/login/oauth/authorize")
    authUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", getCallbackUrl("github", req))
    authUrl.searchParams.set("scope", "read:user user:email")
    authUrl.searchParams.set("state", state)

    return res.redirect(authUrl.toString())
})

const handleGithubOAuthCallback = asyncHandler(async (req, res) => {
    const { code } = req.query
    if (!code) {
        return redirectOAuthError(res, "GitHub sign-in was cancelled")
    }

    verifyOAuthState(req, res, "github")

    const tokenData = await requestJson("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code,
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            redirect_uri: getCallbackUrl("github", req)
        })
    }, "Failed to complete GitHub sign-in")

    if (tokenData.error || !tokenData.access_token) {
        throw new ApiError(400, tokenData.error_description || tokenData.error || "GitHub did not return an access token")
    }

    const profile = await requestJson("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/vnd.github+json"
        }
    }, "Failed to load GitHub profile")

    const emails = await requestJson("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/vnd.github+json"
        }
    }, "Failed to load GitHub email")

    if (!Array.isArray(emails)) {
        throw new ApiError(400, "GitHub did not return account emails")
    }

    const primaryEmail = emails.find((email) => email.primary && email.verified) || emails.find((email) => email.verified)
    if (!primaryEmail?.email) {
        throw new ApiError(403, "GitHub account must have a verified email address")
    }

    const user = await findOrCreateOAuthUser({
        provider: "github",
        providerId: String(profile.id),
        email: primaryEmail.email,
        fullname: profile.name || profile.login || primaryEmail.email.split("@")[0],
        avatar: profile.avatar_url
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    res
        .cookie("accessToken", accessToken, getCookieOptions())
        .cookie("refreshToken", refreshToken, getCookieOptions())

    return redirectOAuthSuccess(res, loggedInUser, accessToken, "github")
})


 const registerAdmin = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  const adminExists = await User.exists({ role: "admin" });

  if (adminExists) {
    throw new ApiError(
      403,
      "Admin already exists. Only admin can create new admins."
    );
  }

  // Validation
  if (!fullname || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  // Check if this specific email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Generate avatar
  let avatarLocalPath = ""
  if (req.file?.path) {
      const avatar = await uploadOnCloudinary(req.file.path);
      avatarLocalPath = avatar?.url || "";
  }

  if (avatarLocalPath === "") {
      avatarLocalPath = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=random&color=fff`;
  }

  // Create admin
  const admin = await User.create({
    fullname,
    email,
    password,
    avatar : avatarLocalPath,
    role: "admin",
  });

  const createdAdmin = await User.findById(admin._id).select("-password -refreshToken");

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while creating admin");
  }

  return res
  .status(201)
  .json(
    new ApiResponse(201, createdAdmin, adminExists ? "Admin created successfully" : "First admin created successfully")
  );
});






export {
    registerUser,
    registerPublicUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    registerAdmin,
    startGoogleOAuth,
    handleGoogleOAuthCallback,
    startGithubOAuth,
    handleGithubOAuthCallback
}
