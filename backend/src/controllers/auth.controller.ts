import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');

export const register = async (req: Request, res: Response): Promise<void> => {
  const { 
    name, email, password, role, phone_number, address,
    yearsOfExp, workLate, workweek, workHours, workOutsideCity, documents
  } = req.body;

  try {
    // 1. Check if user exists
    const existingUser = await query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, bcryptRounds);

    // 3. Start a transaction (manual or implicit)
    // We'll use multiple queries. In a real app, use a transaction.
    
    // Create User
    const newUser = await query(
      'INSERT INTO "user" (name, email, password, role, phone_number, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'client', phone_number, address]
    );

    const userId = newUser.rows[0].id;

    // Create Account (as per schema)
    const account = await query(
      'INSERT INTO account (user_id) VALUES ($1) RETURNING id',
      [userId]
    );
    const accountId = account.rows[0].id;

    if (role === 'provider') {
      // Create Service Provider
      const provider = await query(
        'INSERT INTO service_provider (user_id, years_of_exp, work_late, work_outside_city) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, yearsOfExp || 0, workLate || false, workOutsideCity || false]
      );
      const providerId = provider.rows[0].id;

      // Handle Availability
      if (workweek && Array.isArray(workweek)) {
        for (const day of workweek) {
          await query(
            'INSERT INTO provider_availability (service_provider_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
            [providerId, day, workHours?.start || '09:00', workHours?.end || '17:00']
          );
        }
      }

      // Handle Documents
      if (documents && Array.isArray(documents)) {
        for (const doc of documents) {
          await query(
            'INSERT INTO document (service_provider_id, name, type) VALUES ($1, $2, $3)',
            [providerId, doc.name, doc.type]
          );
        }
      }
    } else {
      // Create Client
      await query(
        'INSERT INTO client (user_id) VALUES ($1)',
        [userId]
      );
    }

    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser.rows[0]
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });

    // Remove password before sending
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT u.*, 
        CASE WHEN u.role = 'provider' THEN (SELECT row_to_json(p) FROM (SELECT * FROM service_provider WHERE user_id = u.id) p)
             WHEN u.role = 'client' THEN (SELECT row_to_json(c) FROM (SELECT * FROM client WHERE user_id = u.id) c)
        END as profile_details
       FROM "user" u WHERE u.id = $1`, 
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];
    delete user.password;

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, phone_number, address, profile_picture } = req.body;

  try {
    const result = await query(
      'UPDATE "user" SET name = COALESCE($1, name), phone_number = COALESCE($2, phone_number), address = COALESCE($3, address), profile_picture = COALESCE($4, profile_picture), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, phone_number, address, profile_picture, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];
    delete user.password;

    res.json({ message: 'Profile updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
