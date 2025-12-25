import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import Message from '../models/messageModel.js'

const app = express()

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    }
})

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}

// use to store online users
const userSocketMap = {}

io.on("connection", async (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId
    if (userId) {
        userSocketMap[userId] = socket.id

        // Mark all undelivered messages to this user as delivered
        try {
            const result = await Message.updateMany(
                { receiverId: userId, isDelivered: false },
                { isDelivered: true, deliveredAt: new Date() }
            );

            if (result.modifiedCount > 0) {
                // Get the updated messages to notify senders
                const updatedMessages = await Message.find({
                    receiverId: userId,
                    isDelivered: true
                }).select('_id senderId');

                // Notify each sender that their message was delivered
                updatedMessages.forEach(msg => {
                    const senderSocketId = userSocketMap[msg.senderId.toString()];
                    if (senderSocketId) {
                        io.to(senderSocketId).emit("messageDelivered", {
                            messageId: msg._id.toString()
                        });
                    }
                });
            }
        } catch (error) {
            console.error("Error marking messages as delivered:", error);
        }
    }

    // use to sent events to all connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Typing indicators
    socket.on("typing", (receiverId) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", userId);
        }
    });

    socket.on("stopTyping", (receiverId) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userStoppedTyping", userId);
        }
    });

    // Read receipts
    socket.on("messageDelivered", (data) => {
        const { messageId, senderId } = data;
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
            io.to(senderSocketId).emit("messageDelivered", { messageId });
        }
    });

    socket.on("messageRead", (data) => {
        const { messageIds, senderId } = data;
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", { messageIds });
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export { io, server, app }