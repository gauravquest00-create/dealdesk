export const errorHandler = (err, req, res, next) => {
  console.error('[DealDesk API Error]', err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal error occurred.',
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
