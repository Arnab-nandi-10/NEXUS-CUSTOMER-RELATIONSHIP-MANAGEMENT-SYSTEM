import mongoose from "mongoose";

const connectDB = async ()=> {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL
        if (!mongoUri) {
            throw new Error("MongoDB URI is not defined in environment variables")
        }
        const connectionInstanse = await mongoose.connect(mongoUri)
        console.log(`\n✅ MONGODB connected !! DB HOST: ${connectionInstanse.connection.host}`);
        console.log(`📦 Database: ${connectionInstanse.connection.name}`);
        
    } catch (error) {
        console.error("❌ MONGODB connection FAILED ", error)
        process.exit(1)
    }
}

export default connectDB