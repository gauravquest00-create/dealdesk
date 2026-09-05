import * as authService from '../services/authService.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { hashPassword } from '../utils/hash.js';

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
      planId,
      billingCycle,
      isPaid,
      paymentDetails,
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
