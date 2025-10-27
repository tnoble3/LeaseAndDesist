const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.query?.token;
    if (!token)
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User not found, authorization denied.' });
            }
            req.user = user;
            next();
        } catch (err) {
            console.error('Auth middleware error:', err);
            res.status(401).json({ message: 'Token is not valid.' });
        }
};