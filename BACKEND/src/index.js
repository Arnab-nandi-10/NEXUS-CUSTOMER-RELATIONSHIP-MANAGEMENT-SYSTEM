import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
.then(()=>{
    const port = process.env.PORT || 8000
    const host = process.env.HOST || "0.0.0.0"

    app.listen(port, host, ()=>{
        console.log(`Server is running at http://${host}:${port}`);
        console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
        console.log(`DB connected to Atlas: ${process.env.MONGODB_URI?.includes('mongodb+srv')}`)
        console.log(`ACCESS_TOKEN_SECRET set: ${!!process.env.ACCESS_TOKEN_SECRET}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed!!! ", err);
})
