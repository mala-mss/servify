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
        (u.fname || ' ' || u.lname) as name,
        u.email,
        u.phone_number,
        u.address as location,
        u.profile_picture,
        sp.idu_sp as provider_id,
        sp.bio,
        sp.years_of_exp,
        sp.rating,
        sp.review_count,
        sp.price_per_hour,
        COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as services,
        COALESCE(array_agg(DISTINCT sc.name) FILTER (WHERE sc.name IS NOT NULL), '{}') as categories
      FROM "user" u
      JOIN service_provider sp ON u.id = sp.idu_sp
      LEFT JOIN providing sps ON sp.idu_sp = sps.idu_sp
      LEFT JOIN service s ON sps.id_s = s.id_s
      LEFT JOIN service_category sc ON s.id_c = sc.id_c
      WHERE 1=1
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

    sql += ` GROUP BY u.id, sp.idu_sp`;

    if (service) {
        sql += ` HAVING array_to_string(array_agg(s.name), ',') ILIKE $${paramIndex}`;
        params.push(`%${service}%`);
        paramIndex++;
    }

    sql += ` ORDER BY sp.rating DESC`;

    let result = await query(sql, params);

    if (result.rows.length === 0) {
        const allProvidersSql = `
            SELECT
                u.id as user_id, (u.fname || ' ' || u.lname) as name, u.email, u.phone_number, u.address as location, u.profile_picture,
                sp.idu_sp as provider_id, sp.bio, sp.years_of_exp, sp.rating, sp.review_count, sp.price_per_hour,
                COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as services,
                COALESCE(array_agg(DISTINCT sc.name) FILTER (WHERE sc.name IS NOT NULL), '{}') as categories
            FROM "user" u
            JOIN service_provider sp ON u.id = sp.idu_sp
            LEFT JOIN providing sps ON sp.idu_sp = sps.idu_sp
            LEFT JOIN service s ON sps.id_s = s.id_s
            LEFT JOIN service_category sc ON s.id_c = sc.id_c
            GROUP BY u.id, sp.idu_sp
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
    const providerSql = `
      SELECT
        u.id as user_id,
        (u.fname || ' ' || u.lname) as name,
        u.email,
        u.phone_number,
        u.address as location,
        u.profile_picture,
        sp.idu_sp as provider_id,
        sp.bio,
        sp.years_of_exp,
        sp.rating,
        sp.review_count,
        sp.price_per_hour,
        COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as services,
        COALESCE(array_agg(DISTINCT sc.name) FILTER (WHERE sc.name IS NOT NULL), '{}') as categories
      FROM "user" u
      JOIN service_provider sp ON u.id = sp.idu_sp
      LEFT JOIN providing sps ON sp.idu_sp = sps.idu_sp
      LEFT JOIN service s ON sps.id_s = s.id_s
      LEFT JOIN service_category sc ON s.id_c = sc.id_c
      WHERE sp.idu_sp = $1
      GROUP BY u.id, sp.idu_sp
    `;

    const providerRes = await query(providerSql, [id]);

    if (providerRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Provider not found' });
      return;
    }

    const provider = providerRes.rows[0];

    // Fetch reviews
    const reviewsSql = `
      SELECT f.*, (u.fname || ' ' || u.lname) as user_name
      FROM feedback f
      JOIN "user" u ON f.idu_cl = u.id
      WHERE f.idu_sp = $1
      ORDER BY f.created_at DESC
    `;
    const reviewsRes = await query(reviewsSql, [id]);
    provider.reviews = reviewsRes.rows;

    // Fetch documents
    const docsSql = `
      SELECT * FROM document WHERE id_user = $1 OR idu_sp = $1
    `;
    const docsRes = await query(docsSql, [id]);
    provider.documents = docsRes.rows;

    res.json({
      success: true,
      provider
    });
  } catch (error: any) {
    console.error('Get provider by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Get provider dashboard data
 */
export const getProviderDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const providerRes = await query('SELECT * FROM service_provider WHERE idu_sp = $1', [userId]);
    if (providerRes.rows.length === 0) {
      res.status(403).json({ success: false, message: 'Not a service provider' });
      return;
    }
    const provider = providerRes.rows[0];
    const providerId = provider.idu_sp;

    const today = new Date().toISOString().split('T')[0];
    const todayJobsRes = await query(`
      SELECT b.*, s.name as service_name, (u.fname || ' ' || u.lname) as client_name
      FROM booking b
      JOIN service s ON b.service_id = s.id_s
      JOIN client c ON b.idu_cl = c.idu_cl
      JOIN "user" u ON c.idu_cl = u.id
      WHERE b.idu_sp = $1 AND b.date = $2
      ORDER BY b.time ASC
    `, [providerId, today]);

    const pendingRequestsRes = await query(`
      SELECT br.*, s.name as service_name, (u.fname || ' ' || u.lname) as client_name
      FROM booking_request br
      JOIN service s ON br.service_id = s.id_s
      JOIN client c ON br.idu_cl = c.idu_cl
      JOIN "user" u ON c.idu_cl = u.id
      WHERE br.idu_sp = $1 AND br.status = 'pending'
      ORDER BY br.date DESC
      LIMIT 5
    `, [providerId]);

    const statsRes = await query(`
      SELECT 
        COUNT(*) as total_jobs,
        (SELECT COALESCE(SUM(amount), 0) FROM payment WHERE idu_sp = $1 AND status = 'paid') as total_earnings
      FROM booking 
      WHERE idu_sp = $1 AND status = 'completed'
    `, [providerId]);

    res.json({
      success: true,
      stats: {
        todayJobsCount: todayJobsRes.rows.length,
        pendingRequestsCount: pendingRequestsRes.rows.length,
        totalEarnings: statsRes.rows[0].total_earnings || 0,
        rating: provider.rating,
        review_count: provider.review_count
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
  console.log('Fetching services for provider user ID:', userId);

  try {
    const sql = `
      SELECT 
        s.id_s as id_service, 
        s.name, 
        s.description, 
        s.base_price, 
        sc.name as category_name
      FROM service s
      JOIN providing sps ON s.id_s = sps.id_s
      LEFT JOIN service_category sc ON s.id_c = sc.id_c
      WHERE sps.idu_sp = $1
    `;
    const result = await query(sql, [userId]);
    console.log(`Found ${result.rows.length} services for user ${userId}`);
    res.json({ success: true, services: result.rows || [] });
  } catch (error: any) {
    console.error('Get provider services error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Add a service to provider's list
 */
export const addProviderService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { serviceId } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "User not authenticated" });
    return;
  }

  try {
    const providerRes = await query("SELECT idu_sp FROM service_provider WHERE idu_sp = $1", [userId]);

    if (providerRes.rows.length === 0) {
      res.status(404).json({ success: false, message: "Provider profile not found for user ID " + userId });
      return;
    }

    const providerId = providerRes.rows[0].idu_sp;

    await query(
      "INSERT INTO providing (idu_sp, id_s) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [providerId, parseInt(serviceId)]
    );

    res.json({ success: true, message: "Service added successfully" });
  } catch (error: any) {
    console.error("Add provider service error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

/**
 * Remove a service from provider's list
 */
export const deleteProviderService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const providerRes = await query('SELECT idu_sp FROM service_provider WHERE idu_sp = $1', [userId]);
    if (providerRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Provider not found' });
        return;
    }
    const providerId = providerRes.rows[0].idu_sp;

    await query(
      'DELETE FROM providing WHERE idu_sp = $1 AND id_s = $2',
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
    const providerRes = await query('SELECT idu_sp FROM service_provider WHERE idu_sp = $1', [userId]);
    const providerId = providerRes.rows[0].idu_sp;

    const transactionsRes = await query(`
      SELECT
        p.id_p as id,
        (u.fname || ' ' || u.lname) as client_name,
        s.name as service_name,
        p.amount,
        p.created_at as date,
        p.status
      FROM payment p
      LEFT JOIN service s ON p.id_s = s.id_s
      LEFT JOIN "user" u ON p.idu_cl = u.id
      WHERE p.idu_sp = $1
      ORDER BY p.created_at DESC
    `, [providerId]);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const statsRes = await query(`
      SELECT
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(amount) FILTER (WHERE created_at >= $2), 0) as month_revenue,
        COALESCE(SUM(amount) FILTER (WHERE status = 'unpaid'), 0) as pending_payout,
        COUNT(DISTINCT id_b) FILTER (WHERE created_at >= $2 AND status = 'paid') as month_jobs
      FROM payment
      WHERE idu_sp = $1
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
    const fname = name.split(' ')[0];
    const lname = name.split(' ').slice(1).join(' ');

    await query(
      'UPDATE "user" SET fname = $1, lname = $2, email = $3, phone_number = $4, address = $5 WHERE id = $6',
      [fname, lname, email, phone_number, address, userId]
    );

    await query(
      'UPDATE service_provider SET bio = $1, years_of_exp = $2, price_per_hour = $3 WHERE idu_sp = $4',
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
  console.log(`[getMyProviderProfile] Fetching profile for user ID: ${userId}`);

  try {
    const sql = `
      SELECT
        (COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) as name, u.email, u.phone_number, u.address,
        sp.bio, sp.years_of_exp, sp.price_per_hour, sp.rating, sp.review_count
      FROM "user" u
      JOIN service_provider sp ON u.id = sp.idu_sp
      WHERE u.id = $1
    `;
    const result = await query(sql, [userId]);

    if (result.rows.length === 0) {
      console.log(`[getMyProviderProfile] Profile not found for user ID: ${userId}`);
      res.status(404).json({ success: false, message: 'Provider profile not found' });
      return;
    }

    console.log(`[getMyProviderProfile] Profile found for user ID: ${userId}`);
    res.json({ success: true, profile: result.rows[0] });
  } catch (error: any) {
    console.error('[getMyProviderProfile] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Get provider's verification documents
 */
export const getMyDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  try {
    const result = await query(
      'SELECT * FROM document WHERE id_user = $1 OR idu_sp = $1 ORDER BY id_doc DESC',
      [userId]
    );
    res.json({ success: true, documents: result.rows });
  } catch (error: any) {
    console.error('Get provider documents error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Upload a new verification document
 */
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { name, type, link } = req.body;

  try {
    // Check if the user is a provider or pending provider
    const userCheck = await query('SELECT id FROM "user" WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const result = await query(
      'INSERT INTO document (id_user, name, type, link, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name, type, link || 'https://via.placeholder.com/150', 'pending']
    );

    res.json({ success: true, message: 'Document uploaded successfully', document: result.rows[0] });
  } catch (error: any) {
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

