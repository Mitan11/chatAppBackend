import express from 'express'
import { protectedRoute } from '../middleware/authMiddleware.js';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/messageController.js';

const router = express.Router()

router.get('/users' , protectedRoute , getUsersForSidebar);

router.get('/:id' , protectedRoute , getMessages);

router.post("/send/:id" , protectedRoute , sendMessage)

export default router;