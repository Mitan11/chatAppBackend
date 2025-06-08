import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        return res.status(200).json({
            status: "success",
            filteredUsers
        })
    } catch (error) {
        console.log("Error fetching users for sidebar", error);
        return res.status(500).json({
            status: "error",
            message: "Error fetching users for sidebar"
        })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        return res.status(200).json({
            status: "success",
            messages
        })

    } catch (error) {
        console.log("Error fetching messages", error);
        return res.status(500).json({
            status: "error",
            message: "Error fetching messages"
        })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save();

        // realtime fun goes here
        const receiverSocketId = getReceiverSocketId(receiverId)

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        return res.status(201).json({
            status: "success",
            message: "Message sent successfully",
            newMessage
        })
    }
    catch (error) {
        console.log("Error sending message", error);
        return res.status(500).json({
            message: "Error sending message"
        })
    }
}
