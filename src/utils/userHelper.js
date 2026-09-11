import jwt from 'jsonwebtoken';

/**
 * Extracts userId from request across multiple possible sources:
 * 1. req.user._id (from protect middleware)
 * 2. Bearer JWT token in Authorization header
 * 3. x-user-id header
 * 4. body / query: userId or userAccountId
 */
export const getRequestUserId = (req) => {
  if (req.user?._id) return String(req.user._id);

  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      if (decoded?.userId) return String(decoded.userId);
    } catch {
      // Ignore token decoding error and fallback to other sources
    }
  }

  const candidate =
    req.headers?.['x-user-id'] ||
    req.body?.userId ||
    req.body?.userAccountId ||
    req.query?.userId ||
    req.query?.userAccountId;

  return candidate ? String(candidate) : null;
};
