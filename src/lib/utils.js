import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.cookie("jwt", token, { 
        maxAge: 7 * 24 * 60 * 60 * 1000, // Fixed: was 100, should be 1000 for milliseconds
        httpOnly: true, 
        secure: process.env.MODE_ENV !== 'development',
        sameSite: process.env.MODE_ENV === 'development' ? 'lax' : 'none' // Required for cross-origin cookies
    })

    return token
}