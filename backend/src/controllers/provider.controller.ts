import { Request, Response } from 'express';
import { query } from '../db';

/**
 * Search providers by location, service, and category
 */
export const searchProviders = async (req: Request, res: Response): Promise<void> => {
  const { location, service, category } = req.query;

  try {
    let sql = `
      SELECT 
        u.id as user_id,
        u.name,
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
        array_agg(DISTINCT s.name) as services,
        array_agg(DISTINCT sc.name) as categories
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

    if (service) {
      sql += ` AND s.name ILIKE $${paramIndex}`;
      params.push(`%${service}%`);
      paramIndex++;
    }

    if (category) {
      sql += ` AND sc.name ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    sql += `
      GROUP BY u.id, sp.id
      ORDER BY sp.rating DESC
    `;

    const result = await query(sql, params);

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
        u.name,
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
        array_agg(DISTINCT s.name) as services,
        array_agg(DISTINCT sc.name) as categories
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
