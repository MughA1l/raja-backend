import jwtConfig from '../config (db connect)/jwt.config.js';
import User from '../models/User.model.js';

export async function generateTokens(user) {
  const accessToken = jwtConfig.generateToken(
    { userId: user._id, email: user.email },
    jwtConfig.expiresIn.accessToken
  );

  const refreshToken = jwtConfig.generateToken(
    { userId: user._id },
    jwtConfig.expiresIn.refreshToken
  );

  // Store refresh token in DB
  await user.addRefreshToken(refreshToken);

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken) {
  // Verify the refresh token
  const decoded = jwtConfig.verifyToken(refreshToken);

  // Find user with this refresh token
  const user = await User.findOne({
    _id: decoded.userId,
    'refreshTokens.token': refreshToken,
    'refreshTokens.expiresAt': { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Invalid refresh token');
  }

  // Generate new access token
  const newAccessToken = jwtConfig.generateToken(
    { userId: user._id, email: user.email },
    jwtConfig.expiresIn.accessToken
  );
  return newAccessToken;
}

export async function logoutUser(user, refreshToken) {
  await user.removeRefreshToken(refreshToken);
}
