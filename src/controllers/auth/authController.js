import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import UserAccount from '../../models/shared/UserAccount.js';
import AuthSession from '../../models/shared/AuthSession.js';
import LoginHistory from '../../models/shared/LoginHistory.js';
import { del, generateKey } from '../../utils/cache.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Hash any string with SHA-256 (used for token storage) */
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/** Sign a short-lived access token */
const signAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, username: user.username, email: user.email },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'kapp_access_secret_link',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

/** Sign a long-lived refresh token */
const signRefreshToken = (user) =>
  jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'kapp_refresh_secret_link',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

/** Extract device/network info from the request */
const extractMeta = (req) => ({
  device: {
    type: req.headers['x-device-type'] || 'desktop',
    name: req.headers['x-device-name'] || 'Unknown',
    userAgent: req.headers['user-agent'] || '',
  },
  network: {
    ipAddress:
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '0.0.0.0',
  },
});

/** Create an AuthSession document and return the raw refresh token */
const createAuthSession = async (userId, meta) => {
  const refreshToken = signRefreshToken({ _id: userId });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await AuthSession.create({
    userId,
    tokens: { refreshTokenHash: hashToken(refreshToken) },
    device: meta.device,
    network: meta.network,
    lastActivityAt: new Date(),
    expiresAt,
    isActive: true,
  });

  return { session, refreshToken };
};

/** Log a login/logout event to LoginHistory */
const logEvent = async (userId, eventType, meta, sessionId = null) => {
  await LoginHistory.create({
    userId,
    event: { type: eventType, timestamp: new Date() },
    device: meta.device,
    network: meta.network,
    sessionId,
    security: { riskLevel: 'low' },
  }).catch(() => {}); // non-blocking — don't fail the request if logging fails
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// ── POST /api/auth/register ───────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const rawEmail = req.body.gmail || req.body.email;
    const { username, password } = req.body;

    if (!rawEmail || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Gmail/email, username, and password are required.',
      });
    }

    const email = String(rawEmail).trim().toLowerCase();
    const cleanUsername = String(username).trim();

    // Validate email/gmail format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Gmail or email address (e.g. user@gmail.com).',
      });
    }

    // Validate username
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters.',
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, underscores, and hyphens.',
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    // Check uniqueness
    const existing = await UserAccount.findOne({
      $or: [
        { email },
        { username: cleanUsername.toLowerCase() },
      ],
    });

    if (existing) {
      const field = existing.email === email ? 'Gmail/email address' : 'username';
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await UserAccount.create({
      email,
      username: cleanUsername,
      password_hash,
    });

    const meta = extractMeta(req);
    const { session, refreshToken } = await createAuthSession(user._id, meta);
    const accessToken = signAccessToken(user);

    await logEvent(user._id, 'successful', meta, session._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          gmail: user.email,
          username: user.username,
          accountStatus: user.accountStatus,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Gmail/email or username already taken.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const rawId = req.body.identifier || req.body.gmail || req.body.email || req.body.username;
    const { password } = req.body;

    if (!rawId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Gmail/email or username and password are required.',
      });
    }

    const identifier = String(rawId).trim();
    const meta = extractMeta(req);

    const user = await UserAccount.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
        { username: identifier },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check account status
    if (user.accountStatus === 'banned' || user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.accountStatus}. Reason: ${user.accountStatusReason || 'Contact support.'}`,
      });
    }

    // Check account lock
    if (user.security.accountLockedUntil && user.security.accountLockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.security.accountLockedUntil - Date.now()) / 60000
      );
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    // Check user has a password (not Google-only account)
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please log in with Google.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      // Increment failed attempts
      const failedAttempts = (user.security.failedLoginAttempts || 0) + 1;
      const update = {
        'security.failedLoginAttempts': failedAttempts,
        'security.lastFailedLoginAt': new Date(),
      };

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        update['security.accountLockedUntil'] = new Date(Date.now() + LOCK_DURATION_MS);
        update['accountStatus'] = 'inactive';
      }

      await UserAccount.updateOne({ _id: user._id }, { $set: update });
      await logEvent(user._id, 'failed', meta);

      const remaining = MAX_FAILED_ATTEMPTS - failedAttempts;
      const lockMsg =
        failedAttempts >= MAX_FAILED_ATTEMPTS
          ? ' Account locked for 30 minutes.'
          : ` ${remaining} attempt(s) remaining before lockout.`;

      return res.status(401).json({ success: false, message: `Invalid credentials.${lockMsg}` });
    }

    // Successful login — reset failed attempts, restore active status
    await UserAccount.updateOne(
      { _id: user._id },
      {
        $set: {
          'security.failedLoginAttempts': 0,
          'security.accountLockedUntil': null,
          lastLoginAt: new Date(),
          accountStatus: 'active',
        },
      }
    );

    const { session, refreshToken } = await createAuthSession(user._id, meta);
    const accessToken = signAccessToken(user);

    await logEvent(user._id, 'successful', meta, session._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          gmail: user.email,
          username: user.username,
          accountStatus: 'active',
          lastLoginAt: new Date(),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/google ─────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required.' });
    }

    // Verify the Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token. Please sign in with Google again.',
      });
    }

    const { sub: googleId, email, name, picture } = payload;
    const meta = extractMeta(req);

    // 1. Try to find existing user by Google ID
    let user = await UserAccount.findOne({ 'socialAuth.google': googleId });
    let isNewUser = false;

    if (!user) {
      // 2. Try to find by email (existing account — link it)
      user = await UserAccount.findOne({ email: email.toLowerCase() });

      if (user) {
        // Link Google ID to existing account
        await UserAccount.updateOne(
          { _id: user._id },
          { $set: { 'socialAuth.google': googleId, emailVerified: true, lastLoginAt: new Date() } }
        );
        user.socialAuth = { ...user.socialAuth, google: googleId };
      } else {
        // 3. Create a brand-new account via Google
        isNewUser = true;
        const rawUsername = `${name?.replace(/\s+/g, '_').toLowerCase() || 'user'}_g`;
        // Make username unique if taken
        let username = rawUsername;
        let suffix = 1;
        while (await UserAccount.exists({ username })) {
          username = `${rawUsername}${suffix++}`;
        }

        user = await UserAccount.create({
          email: email.toLowerCase(),
          username,
          emailVerified: true,
          socialAuth: { google: googleId },
          lastLoginAt: new Date(),
        });
      }
    } else {
      await UserAccount.updateOne(
        { _id: user._id },
        { $set: { lastLoginAt: new Date(), emailVerified: true } }
      );
    }

    // Check account status before issuing tokens
    if (user.accountStatus === 'banned' || user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.accountStatus}. Contact support.`,
      });
    }

    const { session, refreshToken } = await createAuthSession(user._id, meta);
    const accessToken = signAccessToken(user);

    await logEvent(user._id, 'successful', meta, session._id);

    return res.status(200).json({
      success: true,
      message: isNewUser ? 'Account created via Google.' : 'Google login successful.',
      data: {
        accessToken,
        refreshToken,
        isNewUser,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: picture || null,
          accountStatus: user.accountStatus,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'refreshToken is required.' });
    }

    // Verify JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError'
          ? 'Refresh token expired. Please log in again.'
          : 'Invalid refresh token.',
      });
    }

    // Find matching active session by hash
    const tokenHash = hashToken(token);
    const session = await AuthSession.findOne({
      userId: decoded.userId,
      'tokens.refreshTokenHash': tokenHash,
      isActive: true,
      wasRevoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session not found or already revoked. Please log in again.',
      });
    }

    if (session.expiresAt < new Date()) {
      await AuthSession.updateOne({ _id: session._id }, { $set: { isActive: false } });
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    const user = await UserAccount.findById(decoded.userId).select('_id username email accountStatus');
    if (!user || user.accountStatus !== 'active') {
      return res.status(401).json({ success: false, message: 'User account not available.' });
    }

    // Issue new token pair (rotation)
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await AuthSession.updateOne(
      { _id: session._id },
      {
        $set: {
          'tokens.refreshTokenHash': hashToken(newRefreshToken),
          lastActivityAt: new Date(),
          expiresAt: newExpiresAt,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    const userId = req.user._id;
    const meta = extractMeta(req);

    if (token) {
      const tokenHash = hashToken(token);
      await AuthSession.findOneAndUpdate(
        { userId, 'tokens.refreshTokenHash': tokenHash },
        {
          $set: {
            isActive: false,
            wasRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'user_logout',
          },
        }
      );
    } else {
      // Logout all sessions if no specific token provided
      await AuthSession.updateMany(
        { userId, isActive: true },
        {
          $set: {
            isActive: false,
            wasRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'user_logout_all',
          },
        }
      );
    }

    await logEvent(userId, 'logout', meta);

    // ── Bust auth user cache ─────────────────────────────────────────────────
    await del(generateKey('user', 'auth', String(userId)));

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await UserAccount.findById(req.user._id).select(
      '-password_hash -passwordResetToken -passwordResetTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/auth/change-password ──────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.',
      });
    }

    const user = await UserAccount.findById(req.user._id);

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in and has no password to change.',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the current password.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await UserAccount.updateOne(
      { _id: user._id },
      {
        $set: {
          password_hash: newHash,
          'security.passwordChangedAt': new Date(),
        },
      }
    );

    // Revoke all existing sessions (force re-login everywhere)
    await AuthSession.updateMany(
      { userId: user._id, isActive: true },
      {
        $set: {
          isActive: false,
          wasRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'password_changed',
        },
      }
    );

    // ── Bust auth user cache ─────────────────────────────────────────────────
    await del(generateKey('user', 'auth', String(user._id)));

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again on all devices.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'email is required.' });
    }

    const user = await UserAccount.findOne({ email: email.toLowerCase() });

    // Always return 200 to prevent email enumeration attacks
    if (!user || !user.password_hash) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserAccount.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetTokenHash,
          passwordResetTokenExpiry: expiry,
        },
      }
    );

    // TODO: Send email with reset link: `https://yourapp.com/reset-password?token=${resetToken}`
    // In production, integrate an email service (e.g. SendGrid, Resend, Nodemailer)
    console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);

    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      // Only expose token in development for testing
      ...(process.env.NODE_ENV !== 'production' && { devResetToken: resetToken }),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'token and newPassword are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    const tokenHash = hashToken(token);

    const user = await UserAccount.findOne({
      passwordResetToken: tokenHash,
      passwordResetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await UserAccount.updateOne(
      { _id: user._id },
      {
        $set: {
          password_hash: newHash,
          'security.failedLoginAttempts': 0,
          'security.accountLockedUntil': null,
          'security.passwordChangedAt': new Date(),
          accountStatus: 'active',
          passwordResetToken: null,
          passwordResetTokenExpiry: null,
        },
      }
    );

    // Revoke all sessions after reset
    await AuthSession.updateMany(
      { userId: user._id, isActive: true },
      {
        $set: {
          isActive: false,
          wasRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'password_reset',
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/auth/sessions ────────────────────────────────────────────────────
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await AuthSession.find({
      userId: req.user._id,
      isActive: true,
      wasRevoked: false,
    }).select('-tokens').sort({ lastActivityAt: -1 });

    return res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/auth/sessions/:sessionId ─────────────────────────────────────
export const revokeSession = async (req, res) => {
  try {
    const session = await AuthSession.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.user._id, isActive: true },
      {
        $set: {
          isActive: false,
          wasRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'user_revoked',
        },
      },
      { returnDocument: 'after' }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    return res.status(200).json({ success: true, message: 'Session revoked successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
