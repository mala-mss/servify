import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createNotificationInternal } from './notification.controller';

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
       WHERE idU_cl = $1
       OR idU_SP = $1`,
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
      SELECT b.*, (u.fname || ' ' || u.lname) as other_party_name
      FROM booking b
      LEFT JOIN client c ON b.idU_cl = c.idU_cl   
      LEFT JOIN service_provider sp ON b.idU_SP = sp.idU_SP
      LEFT JOIN "user" u ON (u.id = sp.idU_SP OR u.id = c.idU_cl) AND u.id != $1
      WHERE c.idU_cl = $1 OR sp.idU_SP = $1
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
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBookingRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, service_provider_id, date, time } = req.body;
  const userId = req.userId;

  try {
    // Check if user is client
    const clientResult = await query('SELECT idU_cl FROM client WHERE idU_cl = $1', [userId]);
    if (clientResult.rows.length === 0) {
      res.status(403).json({ message: 'Only clients can create booking requests' });
      return;
    }

    // Create booking request (pending state)
    const bookingRequest = await query(
      `INSERT INTO booking_request (idU_cl, idU_SP, service_id, date, time, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, service_provider_id, service_id, date, time, 'pending']
    );

    // Get service name
    const serviceResult = await query('SELECT name FROM service WHERE id_S = $1', [service_id]);
    const serviceName = serviceResult.rows[0].name;

    // Notify provider about new booking request
    await createNotificationInternal(
      service_provider_id,
      'New Booking Request',
      `You have received a new booking request for ${serviceName} on ${date} at ${time}.`,
      'booking'
    );

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully. Waiting for provider acceptance.',
      bookingRequest: bookingRequest.rows[0]
    });
  } catch (error: any) {
    console.error('Create booking request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const acceptBookingRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_R } = req.params;
  const { address } = req.body;
  const userId = req.userId;

  try {
    // Get booking request details
    const requestResult = await query(
      'SELECT * FROM booking_request WHERE id_R = $1 AND status = $2',
      [id_R, 'pending']
    );

    if (requestResult.rows.length === 0) {
      res.status(404).json({ message: 'Booking request not found or already processed' });
      return;
    }

    const bookingRequest = requestResult.rows[0];

    // Verify this provider is the one being requested
    if (userId !== bookingRequest.idU_SP) {
      res.status(403).json({ message: 'Unauthorized to accept this booking request' });
      return;
    }

    // Create confirmed booking
    const booking = await query(
      `INSERT INTO booking (idU_cl, idU_SP, date, time, address, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        bookingRequest.idU_cl,
        bookingRequest.idU_SP,
        bookingRequest.date,
        bookingRequest.time,
        address || null,
        'confirmed'
      ]
    );

    // Update booking request status
    await query(
      'UPDATE booking_request SET status = $1 WHERE id_R = $2 AND idU_cl = $3 AND idU_SP = $4',
      ['accepted', id_R, bookingRequest.idU_cl, bookingRequest.idU_SP]
    );

    // Get service name
    const serviceResult = await query('SELECT name FROM service WHERE id_S = $1', [bookingRequest.service_id]);
    const serviceName = serviceResult.rows[0].name;

    // Notify client that booking was accepted
    await createNotificationInternal(
      bookingRequest.idU_cl,
      'Booking Request Accepted',
      `Your booking request for ${serviceName} has been accepted. Your booking is now confirmed.`,
      'booking'
    );

    res.status(200).json({
      success: true,
      message: 'Booking request accepted and booking confirmed',
      booking: booking.rows[0]
    });
  } catch (error: any) {
    console.error('Accept booking request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const rejectBookingRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_R } = req.params;
  const userId = req.userId;

  try {
    // Get booking request details
    const requestResult = await query(
      'SELECT * FROM booking_request WHERE id_R = $1 AND status = $2',
      [id_R, 'pending']
    );

    if (requestResult.rows.length === 0) {
      res.status(404).json({ message: 'Booking request not found or already processed' });
      return;
    }

    const bookingRequest = requestResult.rows[0];

    // Verify this provider is the one being requested
    if (userId !== bookingRequest.idU_SP) {
      res.status(403).json({ message: 'Unauthorized to reject this booking request' });
      return;
    }

    // Update booking request status
    await query(
      'UPDATE booking_request SET status = $1 WHERE id_R = $2 AND idU_cl = $3 AND idU_SP = $4',
      ['rejected', id_R, bookingRequest.idU_cl, bookingRequest.idU_SP]
    );

    // Notify client that booking was rejected
    await createNotificationInternal(
      bookingRequest.idU_cl,
      'Booking Request Declined',
      `Your booking request has been declined by the provider.`,
      'booking'
    );

    res.status(200).json({
      success: true,
      message: 'Booking request declined'
    });
  } catch (error: any) {
    console.error('Reject booking request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    // Get all booking requests for this provider
    const result = await query(
      `SELECT br.*, (u.fname || ' ' || u.lname) as client_name, s.name as service_name
       FROM booking_request br
       JOIN client c ON br.idU_cl = c.idU_cl
       JOIN "user" u ON c.idU_cl = u.id
       JOIN service s ON br.service_id = s.id_S
       WHERE br.idU_SP = $1
       ORDER BY br.date DESC, br.time DESC`,
      [userId]
    );

    res.json({ bookingRequests: result.rows });
  } catch (error: any) {
    console.error('Get booking requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_B, idU_cl, idU_SP } = req.params;
  const { status } = req.body;

  try {
    const result = await query(
      'UPDATE booking SET status = $1 WHERE id_B = $2 AND idU_cl = $3 AND idU_SP = $4 RETURNING *',
      [status, id_B, idU_cl, idU_SP]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const booking = result.rows[0];

    // Notify based on status change
    if (status === 'completed') {
      await createNotificationInternal(booking.idU_cl, 'Service Completed', 'Your service has been marked as completed. Please leave a review!', 'booking');
      await createNotificationInternal(booking.idU_SP, 'Job Finished', 'You have successfully completed the job.', 'booking');
    } else if (status === 'cancelled') {
      await createNotificationInternal(booking.idU_cl, 'Booking Cancelled', 'The booking has been cancelled.', 'booking');
      await createNotificationInternal(booking.idU_SP, 'Job Cancelled', 'The job has been cancelled.', 'booking');
    }

    res.json({ message: 'Booking updated successfully', booking: result.rows[0] });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
