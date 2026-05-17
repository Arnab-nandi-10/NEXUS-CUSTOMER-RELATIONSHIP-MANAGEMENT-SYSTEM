/**
 * Delete a specific user by email from the database.
 * Usage: node delete-user.js virat@gmail.com
 */
import "dotenv/config"
import mongoose from "mongoose"

const email = process.argv[2]

if (!email) {
    console.error("Usage: node delete-user.js <email>")
    process.exit(1)
}

const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL
await mongoose.connect(mongoUri)
console.log("✅ Connected to MongoDB")

const result = await mongoose.connection.db.collection("users").deleteOne({ email: email.toLowerCase() })

if (result.deletedCount > 0) {
    console.log(`✅ Deleted user: ${email}`)
} else {
    console.log(`⚠️  No user found with email: ${email}`)
}

await mongoose.disconnect()
process.exit(0)
