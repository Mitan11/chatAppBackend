import bcrypt from 'bcryptjs'
import User from '../models/userModel.js';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required',
            });
        }

        // check password length
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            })
        }

        // Check if user already exists
        const user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({
                message: 'Email already exists'
            })
        }

        // generate hashed password
        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            // generate jwt token
            generateToken(newUser._id, res)
            await newUser.save()
            return res.status(201).json({
                message: 'User created successfully',
                success: true,
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            return res.status(400).json({
                message: 'Invalid user data'
            })
        }

    } catch (error) {
        console.log("Error in signin controller", error.message)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "Invalid credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(404).json({
                message: "Invalid credentials"
            })
        }

        generateToken(user._id, res)

        return res.status(200).json({
            message: 'Logged in successfully',
            success: true,
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log("Error in login controller", error.message)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const logout = (req, res) => {
    try {
        res.cookie('jwt', "", { maxAge: '' })
        res.status(200).json({
            message: 'Logged out successfully',
        })
    } catch (error) {
        console.log("Error in logout controller", error.message)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({
                message: 'Profile pic is required',
            })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

        return res.status(200).json({
            message: 'Profile updated successfully',
            success: true,
            updatedUser
        })

    } catch (error) {
        console.log("Error in update profile controller", error.message)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(
            req.user
        )
    } catch (error) {
        console.log("Error in check auth controller", error.message)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}