import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = (process.env.JWT_SECRET || 'your-secret-key') as string;
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
    // Convert userId to string to prevent JSON serialization issues with BigInt
    const userIdString = userId.toString();

    if (role === 'provider') {
      console.log(`[DEBUG] Creating service_provider for user: ${userIdString}`);
      const provider = await query(
        'INSERT INTO service_provider (idu_sp, bio, years_of_exp, work_late, work_outside_city, price_per_hour, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING idu_sp',
        [
          userIdString,
          bio || '',
          yearsOfExp || 0,
          workLate || false,
          workOutsideCity || false,
          pricePerHour || 0,
          workweek && Array.isArray(workweek) ? workweek[0] : null,
          workHours?.start || '09:00',
          workHours?.end || '17:00'
        ]
      );
      const providerId = provider.rows[0].idu_sp;
      console.log(`[DEBUG] Service provider created with ID: ${providerId}`);

      // Handle Documents
      if (documents && Array.isArray(documents)) {      
        for (const doc of documents) {
          await query(
            'INSERT INTO document (idu_sp, name, type, link, width) VALUES ($1, $2, $3, $4, $5)',
            [providerId, doc.name, doc.type, doc.link, doc.width]
          );
        }
      }
    } else if (role === 'admin') {
      console.log(`[DEBUG] Creating admin for user: ${userIdString}`);
      await query('INSERT INTO admin ("idU_A") VALUES ($1)', [userIdString]);
    } else {
      console.log(`[DEBUG] Creating client for user: ${userIdString}`);
      await query(
        'INSERT INTO client (idu_cl) VALUES ($1)',
        [userIdString]
      );
    }

    const token = jwt.sign({ userId: userIdString, role: role || 'client' }, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);

    // Convert the user object to use string ID for JSON serialization
    const userForResponse = {
      ...newUser.rows[0],
      id: userIdString
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userForResponse,
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

  
    const userId = account.user_id;
    // Convert userId to string to prevent JSON serialization issues with BigInt
    const userIdString = userId.toString();
    let role = 'client';

    const adminCheck = await query('SELECT "idU_A" FROM admin WHERE "idU_A" = $1', [userIdString]);
    if (adminCheck.rows.length > 0) {
      role = 'admin';
    } else {
      const providerCheck = await query('SELECT idu_sp FROM service_provider WHERE idu_sp = $1', [userIdString]);
      if (providerCheck.rows.length > 0) {
        role = 'provider';
      }
    }

    const token = jwt.sign({ userId: userIdString, role }, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);

    // Prepare user object for response
    const user = {
      id: userIdString,
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
    console.error('--- LOGIN ERROR DETAILS ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Full Error:', error);
    console.error('---------------------------');
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  console.log(`[DEBUG] Fetching profile for ID: ${id}`);

  try {
    const userResult = await query('SELECT * FROM "user" WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      console.log(`[DEBUG] User with ID ${id} not found.`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = userResult.rows[0];
    
    // Check role and get specific details
    let profileDetails = null;
    let role = 'client';

    console.log(`[DEBUG] Checking service_provider for ID: ${id}`);
    const providerResult = await query('SELECT * FROM service_provider WHERE idu_sp = $1', [id]);
    if (providerResult.rows.length > 0) {
      profileDetails = providerResult.rows[0];
      role = 'provider';
      console.log(`[DEBUG] Found provider role for ID: ${id}`);
    } else {
      console.log(`[DEBUG] Checking admin for ID: ${id}`);
      const adminResult = await query('SELECT "idU_A" FROM admin WHERE "idU_A" = $1', [id]);
      if (adminResult.rows.length > 0) {
        profileDetails = adminResult.rows[0];
        role = 'admin';
        console.log(`[DEBUG] Found admin role for ID: ${id}`);
      } else {
        console.log(`[DEBUG] Checking client for ID: ${id}`);
        const clientResult = await query('SELECT * FROM client WHERE idu_cl = $1', [id]);
        if (clientResult.rows.length > 0) {
          profileDetails = clientResult.rows[0];
          role = 'client';
          console.log(`[DEBUG] Found client role for ID: ${id}`);
        } else {
          console.log(`[DEBUG] Defaulting to client role for ID: ${id}`);
        }
      }
    }

    // Convert id to string to prevent JSON serialization issues with BigInt
    const userForResponse = {
      ...user,
      id: user.id.toString(),
      role: role // Adding role to user object as requested by frontend
    };
    
    console.log(`[DEBUG] Successfully fetched profile for ID: ${id}`);
    res.json({ 
      success: true, 
      user: userForResponse, 
      role, 
      profile_details: profileDetails 
    });
  } catch (error: any) {
    console.error('--- GET PROFILE ERROR ---');
    console.error('ID:', id);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Full Error:', error);
    console.error('--------------------------');
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fname, lname, phone_number, address, profile_picture } = req.body;
  console.log(`[DEBUG] Updating profile for ID: ${id}`);

  try {
    const result = await query(
      'UPDATE "user" SET fname = COALESCE($1, fname), lname = COALESCE($2, lname), phone_number = COALESCE($3, phone_number), address = COALESCE($4, address), profile_picture = COALESCE($5, profile_picture), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [fname, lname, phone_number, address, profile_picture, id]
    );

    if (result.rows.length === 0) {
      console.log(`[DEBUG] User with ID ${id} not found for update.`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Convert id to string to prevent JSON serialization issues with BigInt
    const userForResponse = {
      ...result.rows[0],
      id: result.rows[0].id.toString()
    };
    
    console.log(`[DEBUG] Successfully updated profile for ID: ${id}`);
    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      user: userForResponse 
    });
  } catch (error: any) {
    console.error('--- UPDATE PROFILE ERROR ---');
    console.error('ID:', id);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Full Error:', error);
    console.error('-----------------------------');
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
