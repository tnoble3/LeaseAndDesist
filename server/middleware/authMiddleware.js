import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return secret;
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    console.error('Token verification failed', err);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
