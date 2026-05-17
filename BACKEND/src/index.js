import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({path : './.env'})

connectDB()
.then(()=>{
    const port = process.env.PORT || 8000
    const host = process.env.HOST || "0.0.0.0"

    app.listen(port, host, ()=>{
        console.log(`Server is running at http://${host}:${port}`);
        
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed!!! ", err);
})
