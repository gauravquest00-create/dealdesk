import * as authService from '../services/authService.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { hashPassword } from '../utils/hash.js';
import { ENTITLEMENT_STATUS } from '../constants/statuses.js';

export const signup = async (req, res, next) => {
  try {
    const { 
      businessName, 
      fullName, 
      businessEmail, 
      username,
      password, 
      country, 
      city, 
      currency, 
      timezone, 
      phone,
      planId,
      billingCycle,
      isPaid,
      paymentDetails
    } = req.body;

    if (!businessName || !fullName || !businessEmail || !password) {
      return res.status(400).json({ success: false, message: 'Missing required signup fields', code: 'VALIDATION_ERROR' });
    }

    // ✅ Compute trialEndsAt: 3 days from now (only if not paid)
    let trialEndsAt = null;
    let entitlementStatus = ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION;
    let trialStatus = null;

    if (!isPaid) {
      trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      entitlementStatus = ENTITLEMENT_STATUS.TRIAL_ACTIVE;
      trialStatus = 'ACTIVE';
    }

    // ✅ Pass trialEndsAt to service
    const result = await authService.registerBusinessAndAdmin({
      businessName,
      fullName,
      businessEmail,
      username,
      password,
      country,
      city,
      currency,
      timezone,
      phone,
      planId: planId || 'starter',
      billingCycle: billingCycle || 'monthly',
      isPaid: isPaid || false,
      paymentDetails,
      trialEndsAt, // ✅ Pass along
      entitlementStatus,
      trialStatus,
    });

    res.status(201).json({
      success: true,
      message: isPaid ? 'Workspace created & Subscription activated' : 'Workspace created with 3-Day Free Trial',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// ... rest of authController (login, me, changePassword) unchanged

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/Username and password required', code: 'VALIDATION_ERROR' });
    }

    const result = await authService.loginUser({ identifier, password });
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    let business = null;
    if (user.businessId) {
      business = await Business.findById(user.businessId).lean();
    }
    res.json({ success: true, data: { user, business } });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long', code: 'WEAK_PASSWORD' });
    }

    const user = await User.findById(req.user._id);
    user.passwordHash = await hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
