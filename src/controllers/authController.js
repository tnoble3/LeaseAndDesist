const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

function signAccessToken(user) {
    return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(user) {
    return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
}

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ message: 'Email already in use' });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user = new User({ name, email: email.toLowerCase(), password: hashed });
        await user.save();

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ accessToken, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('signup error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('login error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || null;
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user && Array.isArray(user.refreshTokens)) {
                    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
                    await user.save();
                }
            } catch (e) {
                // token invalid - ignore
            }
        }

        res.clearCookie('refreshToken');
        return res.json({ message: 'Logged out' });
    } catch (err) {
        console.error('logout error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const user = await User.findById(decoded.id);
        if (!user || !Array.isArray(user.refreshTokens) || !user.refreshTokens.includes(token)) {
            return res.status(401).json({ message: 'Refresh token not recognized' });
        }

        const accessToken = signAccessToken(user);
        const newRefresh = signRefreshToken(user);

        // rotate refresh token
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        user.refreshTokens.push(newRefresh);
        await user.save();

        res.cookie('refreshToken', newRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (err) {
        console.error('refreshToken error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
