import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: any;
  userId?: number;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {     
  try {
    const authHeader = req.headers.authorization;       
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: number };

    const result = await query('SELECT id, fname, lname, email FROM "user" WHERE id = $1', [decoded.userId]);     

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid user' });
      return;
    }

    const user = result.rows[0];
    
    // Determine role
    let role = 'client';
    const adminCheck = await query('SELECT id FROM admin WHERE user_id = $1', [user.id]);
    if (adminCheck.rows.length > 0) {
      role = 'admin';
    } else {
      const providerCheck = await query('SELECT id FROM service_provider WHERE user_id = $1', [user.id]);
      if (providerCheck.rows.length > 0) {
        role = 'provider';
      }
    }

    req.user = { ...user, role };
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);     
    if (error instanceof jwt.JsonWebTokenError) {       
      res.status(401).json({ message: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(500).json({ message: 'Authentication error' });
    }
  }
};

export const authorize = (...roles: string[]) => {      
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
