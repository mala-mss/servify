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
    const initialStatus = role === 'provider' ? 'pending' : 'active';
    await query(
      'INSERT INTO account (email, password, status) VALUES ($1, $2, $3)',
      [email, hashedPassword, initialStatus]
    );

    // 4. Insert into user table
    const newUser = await query(
      'INSERT INTO "user" (fname, lname, email, phone_number, address) VALUES ($1, $2, $3, $4, $5) RETURNING "IdU", fname, lname, email',
      [fname, lname, email, phone_number, address]
    );

    const userId = newUser.rows[0].IdU;
    // Convert userId to string to prevent JSON serialization issues with BigInt
    const userIdString = userId.toString();

    if (role === 'provider') {
      console.log(`[DEBUG] Creating inscription_request for user: ${userIdString}`);
      
      // Store provider info in inscription_request
      // Note: We use IdU for idU_SP as the provider ID
      await query(
        `INSERT INTO inscription_request 
         (status, "idU_A") 
         VALUES ($1, $2)`,
        [
          'pending',
          null // No admin assigned yet
        ]
      );
      
      // Also insert into service_provider with the provided details
      await query(
        `INSERT INTO service_provider 
         ("idU_SP", bio, years_of_exp, price_per_hour, work_late, work_outside_city, day_of_week, start_time, end_time) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userIdString,
          bio || '',
          yearsOfExp || 0,
          pricePerHour || 0,
          workLate || false,
          workOutsideCity || false,
          workweek && Array.isArray(workweek) ? workweek[0] : null,
          workHours?.start || '09:00',
          workHours?.end || '17:00'
        ]
      );

      // Handle Documents - link to idU_SP
      if (documents && Array.isArray(documents)) {      
        for (const doc of documents) {
          await query(
            'INSERT INTO document (name, type, link, width, "idU_SP", status) VALUES ($1, $2, $3, $4, $5, $6)',
            [doc.name, doc.type, doc.link, doc.width, userIdString, 'pending']
          );
        }
      }
    } else if (role === 'admin') {
      console.log(`[DEBUG] Creating admin for user: ${userIdString}`);
      await query('INSERT INTO admin ("idU_A") VALUES ($1)', [userIdString]);
    } else {
      console.log(`[DEBUG] Creating client for user: ${userIdString}`);
      await query(
        'INSERT INTO client ("idU_CL") VALUES ($1)',
        [userIdString]
      );
    }

    const token = jwt.sign({ userId: userIdString, role: role || 'client' }, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);

    // Convert the user object to use string ID for JSON serialization
    const userForResponse = {
      ...newUser.rows[0],
      IdU: userIdString
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
  console.log(`[login] Attempt for email: ${email}`);

  try {
    // Join account and user
    const result = await query(
      `SELECT a.email, a.password, u."IdU" as user_id, u.fname, u.lname, u.phone_number, u.address, u.profile_picture
       FROM account a
       JOIN "user" u ON a.email = u.email
       WHERE a.email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log(`[login] No account found for email: ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const account = result.rows[0];

    if (account.status === 'pending') {
      res.status(403).json({ message: 'Your account is pending approval by an administrator.' });
      return;
    }

    if (account.status === 'suspended') {
      res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      console.log(`[login] Invalid password for email: ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

  
    const userId = account.user_id;
    // Convert userId to string to prevent JSON serialization issues with BigInt
    const userIdString = userId.toString();
    let role = 'client';

    console.log(`[login] Checking roles for user ID: ${userId}`);
    const adminCheck = await query('SELECT "idU_A" FROM admin WHERE "idU_A" = $1', [userId]);
    if (adminCheck.rows.length > 0) {
      role = 'admin';
      console.log(`[login] User ${userId} is admin`);
    } else {
      const providerCheck = await query('SELECT "idU_SP" FROM service_provider WHERE "idU_SP" = $1', [userId]);
      if (providerCheck.rows.length > 0) {
        role = 'provider';
        console.log(`[login] User ${userId} is provider`);
      } else {
         console.log(`[login] User ${userId} defaulting to client`);
      }
    }

    const token = jwt.sign({ userId: userIdString, role }, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);

    // Prepare user object for response
    const user = {
      IdU: userIdString,
      email: account.email,
      fname: account.fname,
      lname: account.lname,
      phone_number: account.phone_number,
      address: account.address,
      profile_picture: account.profile_picture,
      role
    };

    console.log(`[login] Login successful for: ${email}`);
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
  console.log(`[getProfile] Fetching profile for ID: ${id}`);

  try {
    const userResult = await query('SELECT * FROM "user" WHERE "IdU" = $1', [id]);
    if (userResult.rows.length === 0) {
      console.log(`[getProfile] User with ID ${id} not found.`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = userResult.rows[0];
    
    // Check role and get specific details
    let profileDetails = null;
    let role = 'client';

    console.log(`[getProfile] Checking roles for ID: ${id}`);
    
    // Check Provider
    const providerResult = await query('SELECT * FROM service_provider WHERE "idU_SP" = $1', [id]);
    if (providerResult.rows.length > 0) {
      profileDetails = providerResult.rows[0];
      role = 'provider';
      console.log(`[getProfile] Found provider role for ID: ${id}`);
    } else {
      // Check Admin
      const adminResult = await query('SELECT "idU_A" FROM admin WHERE "idU_A" = $1', [id]);
      if (adminResult.rows.length > 0) {
        profileDetails = adminResult.rows[0];
        role = 'admin';
        console.log(`[getProfile] Found admin role for ID: ${id}`);
      } else {
        // Check Client
        const clientResult = await query('SELECT * FROM client WHERE "idU_CL" = $1', [id]);
        if (clientResult.rows.length > 0) {
          profileDetails = clientResult.rows[0];
          role = 'client';
          console.log(`[getProfile] Found client role for ID: ${id}`);
        } else {
          console.log(`[getProfile] Defaulting to client role for ID: ${id}`);
        }
      }
    }

    // Convert id to string to prevent JSON serialization issues with BigInt
    const userForResponse = {
      ...user,
      IdU: user.IdU.toString(),
      role: role 
    };
    
    console.log(`[getProfile] Successfully fetched profile for ID: ${id}`);
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
      'UPDATE "user" SET fname = COALESCE($1, fname), lname = COALESCE($2, lname), phone_number = COALESCE($3, phone_number), address = COALESCE($4, address), profile_picture = COALESCE($5, profile_picture), updated_at = CURRENT_TIMESTAMP WHERE "IdU" = $6 RETURNING *',
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
      IdU: result.rows[0].IdU.toString()
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
