import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { ROLES } from '../constants/roles.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid or expired',
        code: 'INVALID_TOKEN'
      });
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated',
        code: 'ACCOUNT_DISABLED'
      });
    }

    req.user = user;

    // Superadmin has no businessId restriction
    if (user.role === ROLES.SUPERADMIN) {
      return next();
    }

    if (!user.businessId) {
      return res.status(403).json({
        success: false,
        message: 'User is not linked to an active business workspace',
        code: 'NO_BUSINESS_CONTEXT'
      });
    }

    const business = await Business.findById(user.businessId).lean();
    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'Business workspace not found',
        code: 'BUSINESS_NOT_FOUND'
      });
    }

    req.business = business;
    req.businessId = business._id;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      error: error.message
    });
  }
};
