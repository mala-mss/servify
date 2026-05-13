import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createNotificationInternal } from './notification.controller';
import { Conversation } from '../models';

// ── GET /bookings/stats ───────────────────────────────────────
export const getBookingStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const stats = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
         COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed,
         COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
         COUNT(*)                                     AS total
       FROM booking
       WHERE idu_cl = $1 OR idu_sp = $1`,
      [userId]
    );

    res.json({ success: true, stats: stats.rows[0] });
  } catch (error: any) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /bookings ─────────────────────────────────────────────
export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { status } = req.query;

  try {
    let sql = `
      SELECT
        b.*,
        (cl.fname || ' ' || cl.lname) AS client_name,
        (sp.fname || ' ' || sp.lname) AS provider_name
      FROM booking b
      JOIN "user" cl ON cl.id = b.idu_cl
      JOIN "user" sp ON sp.id = b.idu_sp
      WHERE b.idu_cl = $1 OR b.idu_sp = $1
    `;
    const params: any[] = [userId];

    if (status) {
      params.push(status);
      sql += ` AND b.status = $${params.length}`;
    }

    sql += ' ORDER BY b.date DESC, b.time DESC';

    const result = await query(sql, params);
    res.json({ success: true, bookings: result.rows });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBookingRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, service_provider_id, date, time, duration } = req.body;
  const userId = req.userId;

  try {
    const clientResult = await query('SELECT idu_cl FROM client WHERE idu_cl = $1', [userId]);
    if (clientResult.rows.length === 0) {
      res.status(403).json({ message: 'Only clients can create booking requests' });
      return;
    }

    const providerResult = await query('SELECT idu_sp FROM service_provider WHERE idu_sp = $1', [service_provider_id]);
    if (providerResult.rows.length === 0) {
      res.status(400).json({ message: 'Invalid service provider ID' });
      return;
    }

    const serviceResult = await query('SELECT id_s FROM service WHERE id_s = $1', [service_id]);
    if (serviceResult.rows.length === 0) {
      res.status(400).json({ message: 'Invalid service ID' });
      return;
    }

    const bookingRequest = await query(
      `INSERT INTO booking_request (idu_cl, idu_sp, service_id, date, time, duration, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, service_provider_id, service_id, date, time, duration ?? null, 'pending']
    );

    // Get service name for notification
    const serviceNameResult = await query('SELECT name FROM service WHERE id_s = $1', [service_id]);
    const serviceName = serviceNameResult.rows[0]?.name ?? 'the requested service';

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

// ── POST /bookings/requests/:id_R/accept ────────────────────
export const acceptBookingRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_R } = req.params;
  const { address } = req.body;
  const userId = req.userId;

  try {
    // Get booking request details
    const requestResult = await query(
      'SELECT * FROM booking_request WHERE id_r = $1 AND status = $2',
      [id_R, 'pending']
    );

    if (requestResult.rows.length === 0) {
      res.status(404).json({ message: 'Booking request not found or already processed' });
      return;
    }

    const br = requestResult.rows[0];

    // Verify this provider is the one being requested
    if (userId !== br.idu_sp) {
      res.status(403).json({ message: 'Unauthorized to accept this booking request' });
      return;
    }

    // Create confirmed booking
    const booking = await query(
      `INSERT INTO booking (idu_cl, idu_sp, date, time, address, status, service_id)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)
       RETURNING *`,
      [br.idu_cl, br.idu_sp, br.date, br.time, address ?? null, br.service_id]
    );

    // Update booking request status
    await query(
      'UPDATE booking_request SET status = $1 WHERE id_r = $2',
      ['accepted', id_R]
    );

    // Find or create conversation
    let [conversation] = await Conversation.findOrCreate({
      where: { idu_cl: br.idu_cl, idu_sp: br.idu_sp }
    });

    // Get service name
    const serviceResult = await query('SELECT name FROM service WHERE id_s = $1', [br.service_id]);
    const serviceName = serviceResult.rows[0]?.name ?? 'the requested service';

    // Notify client that booking was accepted
    await createNotificationInternal(
      br.idu_cl,
      'Booking Request Accepted',
      `Your booking request for ${serviceName} has been accepted. Your booking is now confirmed.`,
      'booking',
      `/chat/${conversation.id}`
    );

    // Notify client to proceed with payment
    await createNotificationInternal(
      br.idu_cl,
      'Payment Required',
      `Your booking for ${serviceName} is confirmed. Please proceed to payment to finalize the arrangement.`,
      'payment',
      `/client/payment/${booking.rows[0].id_b}`
    );

    res.status(200).json({
      success: true,
      message: 'Booking request accepted and booking confirmed',
      booking: booking.rows[0],
      conversationId: conversation.id
    });
  } catch (error: any) {
    console.error('Accept booking request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── POST /bookings/requests/:id_R/reject ────────────────────
export const rejectBookingRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_R } = req.params;
  const userId = req.userId;

  try {
    // Get booking request details
    const requestResult = await query(
      'SELECT * FROM booking_request WHERE id_r = $1 AND status = $2',
      [id_R, 'pending']
    );

    if (requestResult.rows.length === 0) {
      res.status(404).json({ message: 'Booking request not found or already processed' });
      return;
    }

    const br = requestResult.rows[0];

    // Verify this provider is the one being requested
    if (userId !== br.idu_sp) {
      res.status(403).json({ message: 'Unauthorized to reject this booking request' });
      return;
    }

    // Update booking request status
    await query(
      'UPDATE booking_request SET status = $1 WHERE id_r = $2',
      ['rejected', id_R]
    );

    // Notify client that booking was rejected
    await createNotificationInternal(
      br.idu_cl,
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

// ── GET /bookings/requests ────────────────────────────────────
export const getBookingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { role } = req.query; // 'provider' or 'client'

  try {
    // Support both client and provider views
    const whereClause = role === 'client'
      ? 'br.idu_cl = $1'
      : 'br.idu_sp = $1';

    const result = await query(
      `SELECT
         br.*,
         (cl.fname || ' ' || cl.lname) AS client_name,
         (sp.fname || ' ' || sp.lname) AS provider_name,
         s.name                         AS service_name
       FROM booking_request br
       JOIN "user" cl ON cl.id = br.idu_cl
       JOIN "user" sp ON sp.id = br.idu_sp
       LEFT JOIN service s ON s.id_s = br.service_id
       WHERE ${whereClause}
       ORDER BY br.date DESC, br.time DESC`,
      [userId]
    );

    res.json({ success: true, bookingRequests: result.rows });
  } catch (error: any) {
    console.error('Get booking requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── PATCH /bookings/:id_B/status ─────────────────────────────
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_B } = req.params;
  const { status } = req.body;
  const userId = req.userId;

  try {
    const result = await query(
      `UPDATE booking SET status = $1
       WHERE id_b = $2 AND (idu_cl = $3 OR idu_sp = $3)
       RETURNING *`,
      [status, id_B, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Booking not found or unauthorized' });
      return;
    }

    const booking = result.rows[0];

    if (status === 'completed') {
      await Promise.all([
        createNotificationInternal(booking.idu_cl, 'Service Completed', 'Your service has been completed. Please leave a review!', 'booking'),
        createNotificationInternal(booking.idu_sp, 'Job Finished', 'You have successfully completed the job.', 'booking'),
      ]);
    } else if (status === 'cancelled') {
      await Promise.all([
        createNotificationInternal(booking.idu_cl, 'Booking Cancelled', 'Your booking has been cancelled.', 'booking'),
        createNotificationInternal(booking.idu_sp, 'Job Cancelled', 'The job has been cancelled.', 'booking'),
      ]);
    }

    res.json({ success: true, message: 'Booking updated successfully', booking });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
