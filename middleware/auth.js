import jwt from 'jsonwebtoken';
import jwtConfig from '../config (db connect)/jwt.config.js';
import User from '../models/User.model.js';
import ApiError from '../utils ( reusables )/ApiError.js';

// Middleware to protect routes
const auth = async (req, res, next) => {
  try {
    // 1. Read access token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        401,
        'Access token is missing',
        'ACCESS_TOKEN_EXPIRED'
      );
    }

    const accessToken = authHeader.split(' ')[1];

    try {
      // 2. Try verifying the access token
      const decoded = jwt.verify(accessToken, jwtConfig.secret);
      req.user = decoded; // { userId, email }

      return next(); // Token valid — proceed to route handler
    } catch (err) {
      if (err.name !== 'TokenExpiredError') {
        // Invalid token (not expired), block access
        throw new ApiError(
          401,
          'Invalid access token',
          'INVALID_ACCESS_TOKEN'
        );
      }

      // 3. If token expired, check refresh token from cookies
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new ApiError(
          401,
          'Access token expired & refresh token missing',
          'ACCESS_TOKEN_EXPIRED'
        );
      }

      // 4. Try verifying the refresh token
      let decodedRefresh;
      try {
        decodedRefresh = jwtConfig.verifyToken(refreshToken);
      } catch {
        throw new ApiError(
          401,
          'Refresh token is invalid or expired',
          'INVALID_REFRESH_TOKEN'
        );
      }

      // 5. Check if refresh token is in DB and not expired
      const user = await User.findOne({
        _id: decodedRefresh.userId,
        'refreshTokens.token': refreshToken,
        'refreshTokens.expiresAt': { $gt: new Date() },
      });

      if (!user) {
        throw new ApiError(
          401,
          'Refresh token is not valid',
          'INVALID_REFRESH_TOKEN'
        );
      }

      // 6. Generate new access token
      const newAccessToken = jwtConfig.generateToken(
        { userId: user._id, email: user.email },
        jwtConfig.expiresIn.accessToken
      );

      // Send new access token to frontend
      res.setHeader('x-access-token', newAccessToken); // Optional: frontend can pick it up
      req.user = { userId: user._id, email: user.email };
      return next();
    }
  } catch (error) {
    next(error);
  }
};

export default auth;
