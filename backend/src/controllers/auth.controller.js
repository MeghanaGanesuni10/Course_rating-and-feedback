import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const googleClient = new OAuth2Client();

const assertJwtSecretConfigured = () => {
  if (process.env.JWT_SECRET) return;
  const error = new Error('Authentication is not configured on this server.');
  error.statusCode = 503;
  throw error;
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const emailLower = email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or admin.' });
    }

    assertJwtSecretConfigured();

    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      password,
      studentId: studentId?.trim() || null,
      role,
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    assertJwtSecretConfigured();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    const userData = user.toJSON();
    res.status(200).json({ token, user: userData });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google — verify a Google Identity Services credential and sign in/register.
export const googleLogin = async (req, res, next) => {
  try {
    const { credential, role = 'student' } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(503).json({ message: 'Google sign-in is not configured on this server.' });
    }
    if (!credential || !['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'A Google credential and valid account type are required.' });
    }

    assertJwtSecretConfigured();

    let identity;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
      identity = ticket.getPayload();
    } catch {
      return res.status(401).json({ message: 'Google sign-in could not verify this account.' });
    }
    if (!identity?.sub || identity.email_verified !== true || !identity.email) {
      return res.status(401).json({ message: 'Google returned an invalid or unverified account.' });
    }

    const email = identity.email.toLowerCase().trim();
    let user = await User.findOne({ $or: [{ googleId: identity.sub }, { email }] }).select('+googleId');
    if (user && user.role !== role) {
      return res.status(403).json({ message: `This Google account is registered as ${user.role}. Choose the ${user.role} account type.` });
    }

    if (user?.googleId && user.googleId !== identity.sub) {
      return res.status(409).json({ message: 'This email is already connected to a different Google account.' });
    }

    if (user && !user.googleId) {
      const googleControlsEmail = email.endsWith('@gmail.com') || Boolean(identity.hd);
      if (!googleControlsEmail) {
        return res.status(409).json({ message: 'This email already has an account. Sign in with your password first.' });
      }
      user.googleId = identity.sub;
      await user.save();
    }

    if (!user) {
      user = await User.create({
        name: identity.name?.trim() || email.split('@')[0],
        email,
        password: randomBytes(32).toString('hex'),
        googleId: identity.sub,
        role,
      });
    }

    const token = signToken(user._id);
    const userData = user.toJSON();
    delete userData.googleId;
    res.status(200).json({ token, user: userData });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

// PATCH /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, studentId } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (studentId !== undefined) updates.studentId = studentId?.trim() || null;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
