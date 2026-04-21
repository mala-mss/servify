import { Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

/**
 * Search providers by location, service, and category
 */
export const searchProviders = async (req: Request, res: Response): Promise<void> => {
  const { location, service, category } = req.query;

  try {
    let sql = `
      SELECT 
        u.id as user_id,
        (u.fname || ' ' || u.lname),
        u.email,
        u.phone_number,
        u.address as location,
        u.profile_picture,
        sp.id as provider_id,
        sp.bio,
        sp.years_of_exp,
        sp.rating,
        sp.review_count,
        sp.price_per_hour,
        COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as services,
        COALESCE(array_agg(DISTINCT sc.name) FILTER (WHERE sc.name IS NOT NULL), '{}') as categories
      FROM "user" u
      JOIN service_provider sp ON u.id = sp.user_id
      LEFT JOIN service_provider_service sps ON sp.id = sps.service_provider_id
      LEFT JOIN service s ON sps.service_id = s.id_service
      LEFT JOIN service_category sc ON s.category_id_fk = sc.id_category
      WHERE u.role = 'provider'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (location) {
      sql += ` AND u.address ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (category) {
      sql += ` AND sc.name ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    sql += ` GROUP BY u.id, sp.id`;

    // Strict filtering by service if provided
    if (service) {
        sql += ` HAVING array_to_string(array_agg(s.name), ',') ILIKE $${paramIndex}`;
        params.push(`%${service}%`);
        paramIndex++;
    }

    sql += ` ORDER BY sp.rating DESC`;

    let result = await query(sql, params);

    // If no results for a specific filter, OR if no filters at all, 
    // we want to make sure we show providers.
    // Let's check if the query was empty or yielded nothing.
    if (result.rows.length === 0) {
        const allProvidersSql = `
            SELECT 
                u.id as user_id, (u.fname || ' ' || u.lname), u.email, u.phone_number, u.address as location, u.profile_picture,
                sp.id as provider_id, sp.bio, sp.years_of_exp, sp.rating, sp.review_count, sp.price_per_hour,
                COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as services,
                COALESCE(array_agg(DISTINCT sc.name) FILTER (WHERE sc.name IS NOT NULL), '{}') as categories
            FROM "user" u
            JOIN service_provider sp ON u.id = sp.user_id
            LEFT JOIN service_provider_service sps ON sp.id = sps.service_provider_id
            LEFT JOIN service s ON sps.service_id = s.id_service
            LEFT JOIN service_category sc ON s.category_id_fk = sc.id_category
            WHERE u.role = 'provider'
            GROUP BY u.id, sp.id
            ORDER BY sp.rating DESC
        `;
        const allRes = await query(allProvidersSql);
        result = allRes;
    }

    res.json({ 
      success: true,
      count: result.rows.length,
      providers: result.rows 
    });
  } catch (error: any) {
    console.error('Error searching providers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

/**
 * Get provider details by ID
 */
export const getProviderById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT 
        u.id as user_id,
        (u.fname || ' ' || u.lname),
        u.email,
        u.phone_number,
        u.address as location,
        u.profile_picture,
        sp.id as provider_id,
        sp.bio,
        sp.years_of_exp,
        sp.rating,
        sp.review_count,
        sp.price_per_hour,
        COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as services,
        COALESCE(array_agg(DISTINCT sc.name) FILTER (WHERE sc.name IS NOT NULL), '{}') as categories
      FROM "user" u
      JOIN service_provider sp ON u.id = sp.user_id
      LEFT JOIN service_provider_service sps ON sp.id = sps.service_provider_id
      LEFT JOIN service s ON sps.service_id = s.id_service
      LEFT JOIN service_category sc ON s.category_id_fk = sc.id_category
      WHERE sp.id = $1
      GROUP BY u.id, sp.id
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Provider not found' });
      return;
    }

    res.json({ 
      success: true,
      provider: result.rows[0] 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Get provider dashboard data
 */
export const getProviderDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const providerRes = await query('SELECT * FROM service_provider WHERE user_id = $1', [userId]);
    if (providerRes.rows.length === 0) {
      res.status(403).json({ success: false, message: 'Not a service provider' });
      return;
    }
    const provider = providerRes.rows[0];

    const today = new Date().toISOString().split('T')[0];
    const todayJobsRes = await query(`
      SELECT b.*, s.name as service_name, (u.fname || ' ' || u.lname) as client_name
      FROM booking b
      JOIN service s ON b.service_id = s.id_service
      JOIN client c ON b.client_id = c.id_client
      JOIN "user" u ON c.user_id = u.id
      WHERE b.service_provider_id = $1 AND b.date = $2
      ORDER BY b.time ASC
    `, [provider.id, today]);

    const pendingRequestsRes = await query(`
      SELECT b.*, s.name as service_name, (u.fname || ' ' || u.lname) as client_name
      FROM booking b
      JOIN service s ON b.service_id = s.id_service
      JOIN client c ON b.client_id = c.id_client
      JOIN "user" u ON c.user_id = u.id
      WHERE b.service_provider_id = $1 AND b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [provider.id]);

    const statsRes = await query(`
      SELECT 
        COUNT(*) as total_jobs,
        COALESCE(SUM(amount), 0) as total_earnings
      FROM booking b
      LEFT JOIN payment p ON b.id_booking = p.booking_id
      WHERE b.service_provider_id = $1 AND b.status = 'completed'
    `, [provider.id]);

    res.json({
      success: true,
      stats: {
        todayJobsCount: todayJobsRes.rows.length,
        pendingRequestsCount: pendingRequestsRes.rows.length,
        totalEarnings: statsRes.rows[0].total_earnings || 0,
        rating: provider.rating,
        reviewCount: provider.review_count
      },
      todaysJobs: todayJobsRes.rows,
      pendingRequests: pendingRequestsRes.rows
    });

  } catch (error: any) {
    console.error('Provider dashboard error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get provider's services
 */
export const getProviderServices = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const sql = `
      SELECT s.*, sc.name as category_name
      FROM service s
      JOIN service_provider_service sps ON s.id_service = sps.service_id
      JOIN service_provider sp ON sps.service_provider_id = sp.id
      LEFT JOIN service_category sc ON s.category_id_fk = sc.id_category
      WHERE sp.user_id = $1
    `;
    const result = await query(sql, [userId]);
    res.json({ success: true, services: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Add a service to provider's list
 */
export const addProviderService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { serviceId } = req.body;
  const userId = req.userId;

  try {
    const providerRes = await query('SELECT id FROM service_provider WHERE user_id = $1', [userId]);
    const providerId = providerRes.rows[0].id;

    await query(
      'INSERT INTO service_provider_service (service_provider_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [providerId, serviceId]
    );

    res.json({ success: true, message: 'Service added successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Remove a service from provider's list
 */
export const deleteProviderService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const providerRes = await query('SELECT id FROM service_provider WHERE user_id = $1', [userId]);
    const providerId = providerRes.rows[0].id;

    await query(
      'DELETE FROM service_provider_service WHERE service_provider_id = $1 AND service_id = $2',
      [providerId, id]
    );

    res.json({ success: true, message: 'Service removed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get provider earnings and transactions
 */
export const getProviderEarnings = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const providerRes = await query('SELECT id FROM service_provider WHERE user_id = $1', [userId]);
    const providerId = providerRes.rows[0].id;

    const transactionsRes = await query(`
      SELECT 
        p.id_payment as id,
        (u.fname || ' ' || u.lname) as client_name,
        s.name as service_name,
        p.amount,
        p.created_at as date,
        p.status
      FROM payment p
      JOIN booking b ON p.booking_id = b.id_booking
      JOIN service s ON b.service_id = s.id_service
      JOIN client c ON b.client_id = c.id_client
      JOIN "user" u ON c.user_id = u.id
      WHERE b.service_provider_id = $1
      ORDER BY p.created_at DESC
    `, [providerId]);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const statsRes = await query(`
      SELECT 
        SUM(amount) as total_revenue,
        SUM(amount) FILTER (WHERE created_at >= $2) as month_revenue,
        SUM(amount) FILTER (WHERE status = 'unpaid') as pending_payout,
        COUNT(*) FILTER (WHERE created_at >= $2 AND status = 'paid') as month_jobs
      FROM payment p
      JOIN booking b ON p.booking_id = b.id_booking
      WHERE b.service_provider_id = $1
    `, [providerId, firstDayOfMonth]);

    const stats = statsRes.rows[0];

    res.json({
      success: true,
      stats: {
        totalRevenue: stats.total_revenue || 0,
        monthRevenue: stats.month_revenue || 0,
        pendingPayout: stats.pending_payout || 0,
        monthJobs: stats.month_jobs || 0
      },
      transactions: transactionsRes.rows
    });
  } catch (error: any) {
    console.error('Provider earnings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update provider profile
 */
export const updateProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { name, email, phone_number, address, bio, years_of_exp, price_per_hour } = req.body;

  try {
    await query(
      'UPDATE "user" SET name = $1, email = $2, phone_number = $3, address = $4 WHERE id = $5',
      [name, email, phone_number, address, userId]
    );

    await query(
      'UPDATE service_provider SET bio = $1, years_of_exp = $2, price_per_hour = $3 WHERE user_id = $4',
      [bio, years_of_exp, price_per_hour, userId]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Update provider profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get current provider profile
 */
export const getMyProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const sql = `
      SELECT 
        (u.fname || ' ' || u.lname), u.email, u.phone_number, u.address,
        sp.bio, sp.years_of_exp, sp.price_per_hour, sp.rating, sp.review_count
      FROM "user" u
      JOIN service_provider sp ON u.id = sp.user_id
      WHERE u.id = $1
    `;
    const result = await query(sql, [userId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Provider profile not found' });
      return;
    }

    res.json({ success: true, profile: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
