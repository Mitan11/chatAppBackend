import express from 'express'
import { protectedRoute } from '../middleware/authMiddleware.js';
import { getMessages, getUsersForSidebar, sendMessage, markMessagesAsRead } from '../controllers/messageController.js';

const router = express.Router()

router.get('/users', protectedRoute, getUsersForSidebar);

router.get('/:id', protectedRoute, getMessages);

router.post("/send/:id", protectedRoute, sendMessage);

router.put("/read/:id", protectedRoute, markMessagesAsRead);

export default router;