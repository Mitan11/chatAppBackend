import express from 'express'
import authRoutes from './routes/authRoute.js'
import messageRoutes from './routes/messageRoute.js'
import dotenv from 'dotenv'
import { connectDB } from './lib/db.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { app , server } from './lib/socket.js'

dotenv.config()

// port
const PORT = process.env.PORT || 8080;

// middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: '*',
    credentials: true
}))
// 
app.get("/", (req, res) => {
    res.send("Hello World , Server is working")
})

// 
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

server.listen(PORT, (error) => {
    if (!error) {
        console.log(`Server is running on port http://localhost:${PORT}`)
        connectDB();
        return
    }
    console.log(error)
})