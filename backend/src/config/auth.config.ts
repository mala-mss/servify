import dotenv from 'dotenv';

dotenv.config();

export const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
export const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// Parse expiresIn to number (milliseconds) for jwt.sign options
export const getJwtExpiresInMs = (): number => {
  const expiresIn = jwtExpiresIn;
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
};
