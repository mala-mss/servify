import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getInscriptionRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get pending registration requests
    const registrations = await query(`
      SELECT ir.*, u.fname, u.lname, u.email, 'registration' as type
      FROM inscription_request ir
      JOIN "user" u ON ir.id_user = u.id
      WHERE ir.status = 'pending'
    `);

    // Get existing providers with pending document updates
    const documentUpdates = await query(`
      SELECT 
        u.id as id_user, u.fname, u.lname, u.email, 
        MIN(d.created_at) as submitted_at,
        'doc_update' as type,
        0 as id_r
      FROM document d
      JOIN "user" u ON d.id_user = u.id
      LEFT JOIN inscription_request ir ON u.id = ir.id_user AND ir.status = 'pending'
      WHERE d.status = 'pending' AND ir.id_r IS NULL
      GROUP BY u.id
    `);

    const allRequests = [...registrations.rows, ...documentUpdates.rows].sort((a, b) => 
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );

    res.json({ success: true, requests: allRequests });
  } catch (error: any) {
    console.error('Get inscription requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleInscriptionRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected'
  const adminId = req.userId;

  try {
    // Start transaction
    await query('BEGIN');

    // Get the request data
    const irCheck = await query('SELECT * FROM inscription_request WHERE id_r = $1', [id]);
    if (irCheck.rows.length === 0) {
      await query('ROLLBACK');
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    const irData = irCheck.rows[0];
    const userId = irData.id_user;

    // Check if all documents are approved if status is 'approved'
    if (status === 'approved') {
      const docCheck = await query('SELECT status FROM document WHERE id_user = $1', [userId]);
      const allApproved = docCheck.rows.every(doc => doc.status === 'approved');
      const hasDocs = docCheck.rows.length > 0;

      if (hasDocs && !allApproved) {
        await query('ROLLBACK');
        res.status(400).json({ message: 'Cannot approve provider until all documents are verified and approved.' });
        return;
      }
    }

    const irResult = await query(
      'UPDATE inscription_request SET status = $1, id_admin = $2 WHERE id_r = $3 RETURNING id_user',
      [status, adminId, id]
    );

    if (status === 'approved') {
      // Create service_provider entry
      await query(
        `INSERT INTO service_provider 
         (idu_sp, bio, years_of_exp, price_per_hour, work_late, work_outside_city, day_of_week, start_time, end_time) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (idu_sp) DO UPDATE SET
         bio = EXCLUDED.bio,
         years_of_exp = EXCLUDED.years_of_exp,
         price_per_hour = EXCLUDED.price_per_hour,
         work_late = EXCLUDED.work_late,
         work_outside_city = EXCLUDED.work_outside_city,
         day_of_week = EXCLUDED.day_of_week,
         start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time`,
        [
          userId,
          irData.bio,
          irData.years_of_exp,
          irData.price_per_hour,
          irData.work_late,
          irData.work_outside_city,
          irData.day_of_week,
          irData.start_time,
          irData.end_time
        ]
      );

      // Update account status to active
      await query(
        'UPDATE account SET status = $1 WHERE email = (SELECT email FROM "user" WHERE id = $2)',
        ['active', userId]
      );
    }

    await query('COMMIT');
    res.json({ success: true, message: `Request ${status} successfully` });
  } catch (error: any) {
    await query('ROLLBACK');
    console.error('Handle inscription request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRequestDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params; // id_r
  const { userId: queryUserId } = req.query;

  try {
    let userId = queryUserId ? parseInt(queryUserId as string) : null;
    
    if (id !== '0') {
      const irCheck = await query('SELECT id_user FROM inscription_request WHERE id_r = $1', [id]);
      if (irCheck.rows.length > 0) {
        userId = irCheck.rows[0].id_user;
      }
    }

    if (!userId) {
      res.status(400).json({ message: 'User ID or Request ID required' });
      return;
    }
    
    const result = await query('SELECT * FROM document WHERE id_user = $1 ORDER BY created_at DESC', [userId]);
    res.json({ success: true, documents: result.rows });
  } catch (error: any) {
    console.error('Get request documents error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const { docId } = req.params;
  const { status, reason } = req.body; // 'approved' | 'rejected'

  try {
    await query(
      'UPDATE document SET status = $1, rejection_reason = $2 WHERE id_doc = $3',
      [status, reason || null, docId]
    );
    res.json({ success: true, message: `Document ${status} successfully` });
  } catch (error: any) {
    console.error('Verify document error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

