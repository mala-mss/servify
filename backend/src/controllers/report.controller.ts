import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT r.*, 
             u1.fname as reporter_fname, u1.lname as reporter_lname,
             u2.fname as reported_fname, u2.lname as reported_lname
      FROM report r
      JOIN "user" u1 ON r.id_reporter = u1.email
      JOIN "user" u2 ON r.id_reported = u2.email
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, reports: result.rows });
  } catch (error: any) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_reported, reason, description } = req.body;
  const id_reporter = req.user?.email;

  if (!id_reporter) {
    res.status(401).json({ message: 'Reporter email not found' });
    return;
  }

  try {
    await query(
      'INSERT INTO report (id_reporter, id_reported, reason, description) VALUES ($1, $2, $3, $4)',
      [id_reporter, id_reported, reason, description]
    );
    res.status(201).json({ success: true, message: 'Report submitted successfully' });
  } catch (error: any) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_reporter, id_reported } = req.params;
  try {
    await query(
      'DELETE FROM report WHERE id_reporter = $1 AND id_reported = $2',
      [id_reporter, id_reported]
    );
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error: any) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
