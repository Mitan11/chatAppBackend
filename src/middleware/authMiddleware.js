import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protectedRoute = async (req, res, next) => {
    const token = req.cookies.jwt;
    try {
        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized user'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                message: 'Unauthorized - Invalid Token'
            });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        req.user = user;

        next()

    } catch (error) {
        console.log("Error in protected route", error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
} 
