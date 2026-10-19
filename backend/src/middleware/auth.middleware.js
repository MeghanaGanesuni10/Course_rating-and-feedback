import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized — no token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Not authorized — invalid token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden — admin access required.' });
};

export const requireOwnerOrAdmin = (getOwnerId) => (req, res, next) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) return res.status(403).json({ message: 'Forbidden.' });
  if (
    req.user.role === 'admin' ||
    req.user._id.toString() === ownerId.toString()
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden — you do not own this resource.' });
};
