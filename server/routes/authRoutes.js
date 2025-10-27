import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prismaClient.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

const REFRESH_COOKIE_NAME = 'refreshToken';

const getEnv = (key, fallback) => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getJwtSecret = () => getEnv('JWT_SECRET');

const getRefreshTokenTTL = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7);
  return Number.isNaN(days) ? 7 : days;
};

const getAccessTokenTTL = () => process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

const signAccessToken = (userId) => {
  const secret = getJwtSecret();
  return jwt.sign({ userId }, secret, { expiresIn: getAccessTokenTTL() });
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const setRefreshCookie = (res, token) => {
  const maxAgeMs = getRefreshTokenTTL() * 24 * 60 * 60 * 1000;
  const secure = process.env.NODE_ENV === 'production';

  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: maxAgeMs,
    path: '/api/auth',
  });
};

const clearRefreshCookie = (res) => {
  const secure = process.env.NODE_ENV === 'production';
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/api/auth',
  });
};

const issueAuthTokens = async (res, user) => {
  const rawRefreshToken = crypto.randomBytes(48).toString('hex');
  const refreshTokenHash = hashToken(rawRefreshToken);
  const refreshExpiresAt = new Date(Date.now() + getRefreshTokenTTL() * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({ where: { userId: user.id } });
    await tx.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        expiresAt: refreshExpiresAt,
        userId: user.id,
      },
    });
  });

  setRefreshCookie(res, rawRefreshToken);

  const accessToken = signAccessToken(user.id);
  const safeUser = { id: user.id, email: user.email };

  return { accessToken, user: safeUser };
};

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
    });

    const payload = await issueAuthTokens(res, user);
    return res.status(201).json(payload);
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Unable to create account right now.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = await issueAuthTokens(res, user);
    return res.json(payload);
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Unable to log in right now.' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      const refreshHash = hashToken(refreshToken);
      await prisma.refreshToken.deleteMany({ where: { tokenHash: refreshHash } });
    }

    clearRefreshCookie(res);
    return res.json({ message: 'Logged out.' });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ message: 'Unable to log out right now.' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing.' });
    }

    const refreshHash = hashToken(refreshToken);
    const existing = await prisma.refreshToken.findUnique({
      where: { tokenHash: refreshHash },
      include: { user: true },
    });

    if (!existing || existing.expiresAt < new Date()) {
      clearRefreshCookie(res);
      if (existing?.id) {
        await prisma.refreshToken.delete({ where: { id: existing.id } });
      }
      return res.status(401).json({ message: 'Refresh token expired or invalid.' });
    }

    const payload = await issueAuthTokens(res, existing.user);
    return res.json(payload);
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(500).json({ message: 'Unable to refresh session right now.' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('Profile error', err);
    return res.status(500).json({ message: 'Unable to fetch user profile.' });
  }
});

export default router;
