import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()


export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(`Failed to connect to MongoDB: ${error.message}`)
        process.exit(1)
    }
}