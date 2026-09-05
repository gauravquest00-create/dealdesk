import { ROLES } from '../constants/roles.js';

export const requireRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
    
    // Superadmin always has root bypass for platform operations
    if (req.user.role === ROLES.SUPERADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]`,
        code: 'FORBIDDEN_ROLE'
      });
    }

    next();
  };
};
