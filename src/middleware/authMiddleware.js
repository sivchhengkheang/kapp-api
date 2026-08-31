import jwt from 'jsonwebtoken';
import UserAccount from '../models/shared/UserAccount.js';

/**
 * protect — verifies the Bearer access token on protected routes.
 * Attaches { _id, username, email, accountStatus } to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Access token expired. Please refresh your token.'
          : 'Invalid access token.';
      return res.status(401).json({ success: false, message });
    }

    // Fetch user to make sure account is still active
    const user = await UserAccount.findById(decoded.userId).select(
      '_id username email accountStatus'
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.accountStatus}. Access denied.`,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
