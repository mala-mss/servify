import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';

// ── GET /payments  (admin only) ───────────────────────────────
export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;

  try {
    const params: any[] = [];
    let whereClause = '';

    if (status) {
      params.push(status);
      whereClause = `WHERE p.status = $${params.length}`;
    }

    const result = await query(
      `SELECT p.id_p,
              p.amount,
              p.currency,
              p.status,
              p.payment_method,
              p.created_at,
              s.id_s,
              s.name   AS service_name,
              s.base_price
       FROM payment p
       LEFT JOIN service s ON p.id_s = s.id_s
       ${whereClause}
       ORDER BY p.created_at DESC`,
      params
    );

    res.json({ success: true, payments: result.rows });
  } catch (error: any) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /payments/:id ─────────────────────────────────────────
export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT p.id_p,
              p.amount,
              p.currency,
              p.status,
              p.payment_method,
              p.created_at,
              s.id_s,
              s.name        AS service_name,
              s.description AS service_description,
              s.base_price
       FROM payment p
       LEFT JOIN service s ON p.id_s = s.id_s
       WHERE p.id_p = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    res.json({ success: true, payment: result.rows[0] });
  } catch (error: any) {
    console.error('Get transaction by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── POST /payments  (admin only) ──────────────────────────────
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_s, amount, payment_method, status } = req.body;

  if (!amount) {
    res.status(400).json({ message: 'amount is required' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO payment (id_s, amount, payment_method, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_s ?? null, amount, payment_method ?? null, status ?? 'unpaid']
    );

    res.status(201).json({ message: 'Payment created successfully', payment: result.rows[0] });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── PATCH /payments/:id  (admin only) ────────────────────────
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, payment_method } = req.body;

  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const result = await query(
      `UPDATE payment
       SET status         = COALESCE($1, status),
           payment_method = COALESCE($2, payment_method)
       WHERE id_p = $3
       RETURNING *`,
      [status ?? null, payment_method ?? null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    res.json({ message: 'Payment updated successfully', payment: result.rows[0] });
  } catch (error: any) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── DELETE /payments/:id  (admin only) ───────────────────────
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const result = await query(
      'DELETE FROM payment WHERE id_p = $1 RETURNING id_p',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /payments/user/:userId  ───────────────────────────────
// Payments for services booked by a specific client,
// resolved via: booking → booking_request → payment(id_s)
export const getUserTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId || req.userId;

  try {
    const result = await query(
      `SELECT p.id_p,
              p.amount,
              p.currency,
              p.status,
              p.payment_method,
              p.created_at,
              s.name AS service_name,
              b.date AS booking_date,
              b.time AS booking_time
       FROM payment p
       JOIN service s       ON p.id_s  = s.id_s
       JOIN booking_request br ON br.service_id = s.id_s AND br.idu_cl = $1
       JOIN booking b       ON b.idu_cl = br.idu_cl AND b.idu_sp = br.idu_sp
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ success: true, payments: result.rows });
  } catch (error: any) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /payments/summary/:userId  ───────────────────────────
export const getTransactionSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const result = await query(
      `SELECT
         COUNT(*)                                            AS total_count,
         COALESCE(SUM(p.amount), 0)                        AS total,
         COALESCE(SUM(CASE WHEN p.status = 'paid'   THEN p.amount ELSE 0 END), 0) AS paid,
         COALESCE(SUM(CASE WHEN p.status = 'unpaid' THEN p.amount ELSE 0 END), 0) AS unpaid
       FROM payment p
       JOIN service s       ON p.id_s = s.id_s
       JOIN booking_request br ON br.service_id = s.id_s AND br.idu_cl = $1`,
      [userId]
    );

    const row = result.rows[0];
    res.json({
      success: true,
      summary: {
        total_count : parseInt(row.total_count, 10),
        total  : parseFloat(row.total),
        paid   : parseFloat(row.paid),
        unpaid : parseFloat(row.unpaid),
        currency: 'DZD'
      }
    });
  } catch (error: any) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};