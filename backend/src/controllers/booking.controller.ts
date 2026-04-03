import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getBookingStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const stats = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
       FROM booking 
       WHERE client_id = (SELECT id_client FROM client WHERE user_id = $1)
       OR service_provider_id = (SELECT id FROM service_provider WHERE user_id = $1)`,
      [userId]
    );

    res.json({ stats: stats.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { status } = req.query;

  try {
    let sql = `
      SELECT b.*, s.name as service_name, u.name as other_party_name
      FROM booking b
      JOIN service s ON b.service_id = s.id_service
      LEFT JOIN client c ON b.client_id = c.id_client
      LEFT JOIN service_provider sp ON b.service_provider_id = sp.id
      LEFT JOIN "user" u ON (u.id = sp.user_id OR u.id = c.user_id) AND u.id != $1
      WHERE c.user_id = $1 OR sp.user_id = $1
    `;
    const params: any[] = [userId];

    if (status) {
      sql += ' AND b.status = $2';
      params.push(status);
    }

    sql += ' ORDER BY b.date DESC, b.time DESC';

    const result = await query(sql, params);
    res.json({ bookings: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, service_provider_id, date, time, address, amount } = req.body;
  const userId = req.userId;

  try {
    // Get client_id
    const clientResult = await query('SELECT id_client FROM client WHERE user_id = $1', [userId]);
    if (clientResult.rows.length === 0) {
      res.status(403).json({ message: 'Only clients can create bookings' });
      return;
    }
    const clientId = clientResult.rows[0].id_client;

    // Create booking
    const booking = await query(
      'INSERT INTO booking (client_id, service_provider_id, service_id, date, time, address, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [clientId, service_provider_id, service_id, date, time, address, 'confirmed']
    );

    const bookingId = booking.rows[0].id_booking;

    // Create payment entry
    await query(
      'INSERT INTO payment (booking_id, amount, status) VALUES ($1, $2, $3)',
      [bookingId, amount, 'unpaid']
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: booking.rows[0]
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await query(
      'UPDATE booking SET status = $1 WHERE id_booking = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.json({ message: 'Booking updated successfully', booking: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
