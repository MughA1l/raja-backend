import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'a#2rDkk233@djfks$W',
  // Token expiration times
  expiresIn: {
    accessToken: '15m',
    refreshToken: '7d',
  },

  // Generate tokens
  generateToken(payload, expiresIn) {
    return jwt.sign(payload, this.secret, { expiresIn });
  },

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },
};

export default jwtConfig;
