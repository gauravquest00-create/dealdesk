import crypto from 'crypto';

/**
 * Generates a secure random password (default 10 chars)
 * Ensures at least: 1 uppercase, 1 lowercase, 1 digit, 1 special
 */
export const generateRandomPassword = (length = 10) => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$%&*!';
  const all = upper + lower + digits + special;

  let password = '';
  password += upper[crypto.randomInt(0, upper.length)];
  password += lower[crypto.randomInt(0, lower.length)];
  password += digits[crypto.randomInt(0, digits.length)];
  password += special[crypto.randomInt(0, special.length)];

  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(0, all.length)];
  }

  // Fisher-Yates shuffle
  const arr = password.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};
