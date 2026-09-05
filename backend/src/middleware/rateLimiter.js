const requests = new Map();

export const rateLimiter = (options = { windowMs: 60000, max: 100 }) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown_ip';
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    const record = requests.get(ip);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + options.windowMs;
      return next();
    }

    record.count++;
    if (record.count > options.max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    next();
  };
};
