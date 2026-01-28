import ApiError from '../utils ( reusables )/ApiError.js';

function errorHandler(err, req, res, next) {
  // Check if the error is a custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.statusCode,
        type: err.type,
      },
    });
  }
  // It's good practice to log the full error for debugging in development.
  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: {
      code: 500,
      type: 'SERVER_ERROR',
    },
  });
}
export default errorHandler;
