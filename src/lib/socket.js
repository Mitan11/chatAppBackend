import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["https://chat-app-khaki-nu-55.vercel.app"],
        credentials: true
    }
})

export function getReceiverSocketId(userId){
    return userSocketMap[userId]
}

// use to store online users
const userSocketMap = {}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId
    if (userId) {
        userSocketMap[userId] = socket.id
    }

    // use to sent events to all connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];

    })
})

export { io, server, app }