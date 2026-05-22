import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createNotificationInternal } from './notification.controller';
import { Conversation } from '../models';

// ── GET /bookings/stats ───────────────────────────────────────
export const getBookingStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const role = req.user?.role;

  try {
    let whereClause = 'WHERE idu_cl = $1 OR idu_sp = $1';
    let params = [userId];

    if (role === 'admin') {
      whereClause = '';
      params = [];
    }

    const statsResult = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed,
         COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
         COUNT(*)                                     AS total
       FROM booking
       ${whereClause}`,
      params
    );

    const pendingResult = await query(
      `SELECT COUNT(*) as pending FROM booking_request
       ${whereClause.replace('idu_cl', 'idu_cl').replace('idu_sp', 'idu_sp')} AND status = 'pending'`,
      params
    );

    const stats = {
      ...statsResult.rows[0],
      pending: parseInt(pendingResult.rows[0]?.pending || '0')
    };

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /bookings ─────────────────────────────────────────────
export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const role = req.user?.role;
  const { status } = req.query;

  try {
    let sql = `
      SELECT
        b.*,
        s.name AS service_name,
        (cl.fname || ' ' || cl.lname) AS client_name,
        (sp.fname || ' ' || sp.lname) AS provider_name,
        EXISTS (SELECT 1 FROM payment p WHERE p.id_b = b.id_b AND p.stage = 1 AND p.status = 'paid') as first_payment_done,
        EXISTS (SELECT 1 FROM payment p WHERE p.id_b = b.id_b AND p.stage = 2 AND p.status = 'paid') as second_payment_done
      FROM booking b
      JOIN "user" cl ON cl.id = b.idu_cl
      JOIN "user" sp ON sp.id = b.idu_sp
      LEFT JOIN service s ON s.id_s = b.service_id
    `;

    const params: any[] = [];
    let whereConditions: string[] = [];

    if (role !== 'admin') {
      params.push(userId);
      whereConditions.push(`(b.idu_cl = $${params.length} OR b.idu_sp = $${params.length})`);
    }

    if (status) {
      params.push(status);
      whereConditions.push(`b.status = $${params.length}`);
    }

    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
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
  const { service_id, service_provider_id, date, time, duration, id_dep } = req.body;
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

    // Optional: Verify dependant belongs to client
    if (id_dep) {
      const depResult = await query('SELECT id_dep FROM dependant WHERE id_dep = $1 AND id_u_cl = $2', [id_dep, userId]);
      if (depResult.rows.length === 0) {
        res.status(400).json({ message: 'Invalid dependant ID' });
        return;
      }
    }

    const bookingRequest = await query(
      `INSERT INTO booking_request (idu_cl, idu_sp, service_id, date, time, duration, status, id_dep)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, service_provider_id, service_id, date, time, duration ?? null, 'pending', id_dep ?? null]
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
      `INSERT INTO booking (idu_cl, idu_sp, date, time, address, status, service_id, id_dep)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6, $7)
       RETURNING *`,
      [br.idu_cl, br.idu_sp, br.date, br.time, address ?? null, br.service_id, br.id_dep]
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
      `/client/checkout?bookingId=${booking.rows[0].id_b}`
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
  const role = req.user?.role;

  try {
    let sql = `UPDATE booking SET status = $1 WHERE id_b = $2`;
    let params = [status, id_B];

    if (role !== 'admin') {
      sql += ` AND (idu_cl = $3 OR idu_sp = $3)`;
      params.push(userId);
    }

    const result = await query(sql + ' RETURNING *', params);

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

export const requestFirstHalfPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_B } = req.params;
  const userId = req.userId;

  try {
    const result = await query(
      `SELECT b.*, s.name as service_name 
       FROM booking b 
       LEFT JOIN service s ON s.id_s = b.service_id 
       WHERE b.id_b = $1::integer AND b.idu_sp = $2`,
      [id_B, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Booking not found or unauthorized' });
      return;
    }

    const booking = result.rows[0];
    const serviceName = booking.service_name || 'your service';

    await createNotificationInternal(
      booking.idu_cl,
      'Payment Required',
      `The provider has requested the first half of the payment for ${serviceName}.`,
      'payment',
      `/client/checkout?bookingId=${id_B}`
    );

    res.json({ success: true, message: 'First half payment request sent to client' });
  } catch (error: any) {
    console.error('Request first half payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requestSecondHalfPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_B } = req.params;
  const userId = req.userId;

  try {
    const result = await query(
      `SELECT b.*, s.name as service_name 
       FROM booking b 
       LEFT JOIN service s ON s.id_s = b.service_id 
       WHERE b.id_b = $1::integer AND b.idu_sp = $2`,
      [id_B, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Booking not found or unauthorized' });
      return;
    }

    const booking = result.rows[0];
    const serviceName = booking.service_name || 'your service';

    await createNotificationInternal(
      booking.idu_cl,
      'Second Half Payment Required',
      `The provider has requested the second half of the payment for ${serviceName}.`,
      'payment',
      `/client/checkout?bookingId=${id_B}&stage=second`
    );

    res.json({ success: true, message: 'Second half payment request sent to client' });
  } catch (error: any) {
    console.error('Request second half payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_B } = req.params;
  const userId = req.userId;
  const role = req.user?.role;

  try {
    let sql = `
      SELECT
        b.*,
        (cl.fname || ' ' || cl.lname) AS client_name,
        cl.phone_number AS client_phone,
        cl.address AS client_address,
        (sp.fname || ' ' || sp.lname) AS provider_name,
        s.name AS service_name,
        s.base_price AS amount
      FROM booking b
      JOIN "user" cl ON cl.id = b.idu_cl
      JOIN "user" sp ON sp.id = b.idu_sp
      LEFT JOIN service s ON s.id_s = b.service_id
      WHERE b.id_b = $1::integer
    `;
    
    const params: (string | number)[] = [id_B];

    if (role !== 'admin') {
      if (userId === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      sql += ` AND (b.idu_cl = $2 OR b.idu_sp = $2)`;
      params.push(userId);
    }

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.json({ success: true, booking: result.rows[0] });
  } catch (error: any) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
