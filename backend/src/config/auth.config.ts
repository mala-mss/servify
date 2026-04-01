import dotenv from 'dotenv';

dotenv.config();

export const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
export const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
