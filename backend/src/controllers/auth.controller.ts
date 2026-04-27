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
  console.log("REQ BODY", req.body);
  const {
  name, email, password, role, phone_number, address, 
  yearsOfExp, workLate, workweek, workHours, workOutsideCity, documents,
  bio, pricePerHour
} = req.body;

let fname = req.body.fname;
let lname = req.body.lname;

if (name && (!fname || !lname)) {
  const parts = name.split(" ");
  fname = parts[0];
  lname = parts.slice(1).join(" ") || "N/A";
}

  try {
    // 1. Check if user exists in account table
    const existingAccount = await query('SELECT * FROM account WHERE email = $1', [email]);
    if (existingAccount.rows.length > 0) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, bcryptRounds);

    // 3. Insert into account table
    await query(
      'INSERT INTO account (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );

    // 4. Insert into user table
    const newUser = await query(
      'INSERT INTO "user" (fname, lname, email, phone_number, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, fname, lname, email',
      [fname, lname, email, phone_number, address]
    );

    const userId = newUser.rows[0].id;

    if (role === 'provider') {
      // Create Service Provider
      const provider = await query(
        'INSERT INTO service_provider (user_id, bio, years_of_exp, work_late, work_outside_city, price_per_hour) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [userId, bio || '', yearsOfExp || 0, workLate || false, workOutsideCity || false, pricePerHour || 0]
      );
      const providerId = provider.rows[0].id;

      // Handle Availability (provider_availability table)
      if (workweek && Array.isArray(workweek)) {        
        for (const day of workweek) {
          await query(
            'INSERT INTO provider_availability (service_provider_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
            [providerId, day, workHours?.start || '09:00', workHours?.end || '17:00']
          );
        }
      }

      // Handle Documents (document table)
      if (documents && Array.isArray(documents)) {      
        for (const doc of documents) {
          await query(
            'INSERT INTO document (service_provider_id, name, type, link, width) VALUES ($1, $2, $3, $4, $5)',
            [providerId, doc.name, doc.type, doc.link, doc.width]
          );
        }
      }
    } else if (role === 'admin') {
      await query('INSERT INTO admin (user_id) VALUES ($1)', [userId]);
    } else {
      // Create Client (default)
      await query(
        'INSERT INTO client (user_id) VALUES ($1)',     
        [userId]
      );
    }

    const token = jwt.sign({ userId, role: role || 'client' }, jwtSecret, { expiresIn: jwtExpiresIn });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser.rows[0],
      role: role || 'client'
    });
  } catch (error: any) {
    console.error('Registration error:', error);        
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Join account and user
    const result = await query(
      `SELECT a.email, a.password, u.id as user_id, u.fname, u.lname, u.phone_number, u.address, u.profile_picture
       FROM account a
       JOIN "user" u ON a.email = u.email
       WHERE a.email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const account = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Determine role
    const userId = account.user_id;
    let role = 'client';
    
    const adminCheck = await query('SELECT id FROM admin WHERE user_id = $1', [userId]);
    if (adminCheck.rows.length > 0) {
      role = 'admin';
    } else {
      const providerCheck = await query('SELECT id FROM service_provider WHERE user_id = $1', [userId]);
      if (providerCheck.rows.length > 0) {
        role = 'provider';
      }
    }

    const token = jwt.sign({ userId, role }, jwtSecret, { expiresIn: jwtExpiresIn });

    // Prepare user object for response
    const user = {
      id: userId,
      email: account.email,
      fname: account.fname,
      lname: account.lname,
      phone_number: account.phone_number,
      address: account.address,
      profile_picture: account.profile_picture,
      role
    };

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
    const userResult = await query('SELECT * FROM "user" WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = userResult.rows[0];
    
    // Check role and get specific details
    let profileDetails = null;
    let role = 'client';

    const providerResult = await query('SELECT * FROM service_provider WHERE user_id = $1', [id]);
    if (providerResult.rows.length > 0) {
      profileDetails = providerResult.rows[0];
      role = 'provider';
    } else {
      const adminResult = await query('SELECT id FROM admin WHERE user_id = $1', [id]);
      if (adminResult.rows.length > 0) {
        profileDetails = adminResult.rows[0];
        role = 'admin';
      } else {
        const clientResult = await query('SELECT * FROM client WHERE user_id = $1', [id]);
        if (clientResult.rows.length > 0) {
          profileDetails = clientResult.rows[0];
        }
      }
    }

    res.json({ user: { ...user, role, profile_details: profileDetails } });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fname, lname, phone_number, address, profile_picture } = req.body;

  try {
    const result = await query(
      'UPDATE "user" SET fname = COALESCE($1, fname), lname = COALESCE($2, lname), phone_number = COALESCE($3, phone_number), address = COALESCE($4, address), profile_picture = COALESCE($5, profile_picture), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [fname, lname, phone_number, address, profile_picture, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
