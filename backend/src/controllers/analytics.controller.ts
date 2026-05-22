import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. KPI Cards - Global Stats
    const totalBookings = await query('SELECT COUNT(*) FROM booking');
    const newClients = await query('SELECT COUNT(*) FROM client');
    const totalRevenue = await query('SELECT SUM(amount) FROM payment WHERE status = \'paid\'');
    const activeProviders = await query('SELECT COUNT(*) FROM service_provider');

    // 2. Bookings By Period (Last 30 Days)
    const bookingsByPeriod = await query(`
      SELECT TO_CHAR(date, 'Mon DD') as name, COUNT(*) as value
      FROM booking
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(date), TO_CHAR(date, 'Mon DD')
      ORDER BY DATE(date) ASC
    `);

    // 3. New Clients vs New Providers (Last 30 Days)
    const clientsByPeriod = await query(`
      SELECT TO_CHAR(created_at, 'Mon DD') as name, COUNT(*) as clients
      FROM "user" u
      JOIN client c ON u.id = c.idu_cl
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Mon DD')
      ORDER BY DATE(created_at) ASC
    `);

    const providersByPeriod = await query(`
      SELECT TO_CHAR(created_at, 'Mon DD') as name, COUNT(*) as providers
      FROM "user" u
      JOIN service_provider sp ON u.id = sp.idu_sp
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Mon DD')
      ORDER BY DATE(created_at) ASC
    `);

    // 4. Revenue Trend (Last 30 Days)
    const revenueTrend = await query(`
      SELECT TO_CHAR(created_at, 'Mon DD') as name, SUM(amount) as amount
      FROM payment
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND status = 'paid'
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Mon DD')
      ORDER BY DATE(created_at) ASC
    `);

    // 5. Bookings per Service Category
    const bookingsByService = await query(`
      SELECT sc.name, COUNT(b.id_b) as value
      FROM service_category sc
      LEFT JOIN service s ON sc.id_c = s.id_c
      LEFT JOIN booking b ON s.id_s = b.service_id
      GROUP BY sc.name
      ORDER BY value DESC
    `);

    // 6. Average Rating per Service
    const ratingsByService = await query(`
      SELECT sc.name as subject, COALESCE(AVG(f.overall_rating), 0) as A, 5 as fullMark
      FROM service_category sc
      LEFT JOIN service s ON sc.id_c = s.id_c
      LEFT JOIN providing p ON s.id_s = p.id_s
      LEFT JOIN feedback f ON p.idu_sp = f.idu_sp
      GROUP BY sc.name
    `);

    // 7. Booking Status Breakdown per Service
    const statusByService = await query(`
      SELECT sc.name, 
             COUNT(CASE WHEN b.status = 'confirmed' OR b.status = 'completed' THEN 1 END) as confirmed,
             COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending,
             COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled
      FROM service_category sc
      LEFT JOIN service s ON sc.id_c = s.id_c
      LEFT JOIN booking b ON s.id_s = b.service_id
      GROUP BY sc.name
    `);

    // 8. Revenue per Service
    const revenueByService = await query(`
      SELECT sc.name, COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'paid'), 0) as value
      FROM service_category sc
      LEFT JOIN service s ON sc.id_c = s.id_c
      LEFT JOIN payment p ON s.id_s = p.id_s
      GROUP BY sc.name
      ORDER BY value DESC
    `);

    // 9. Incidents
    const incidentsByPeriod = await query(`
      SELECT TO_CHAR(created_at, 'Mon DD') as name, COUNT(*) as value
      FROM report
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Mon DD')
      ORDER BY DATE(created_at) ASC
    `);

    const incidentsByService = await query(`
      SELECT sc.name, COUNT(r.*) as value
      FROM service_category sc
      LEFT JOIN service s ON sc.id_c = s.id_c
      LEFT JOIN providing pr ON s.id_s = pr.id_s
      LEFT JOIN service_provider sp ON pr.idu_sp = sp.idu_sp
      LEFT JOIN "user" u ON sp.idu_sp = u.id
      LEFT JOIN report r ON u.email = r.id_reported
      GROUP BY sc.name
    `);

    const incidentsByReason = await query(`
      SELECT reason as name, COUNT(*) as value
      FROM report
      GROUP BY reason
    `);

    // 10. Warning Level Distribution
    const warningDistribution = await query(`
      SELECT 
        CASE 
          WHEN nbr_warning = 0 THEN '0 Warnings'
          WHEN nbr_warning = 1 THEN '1 Warning'
          ELSE '2+ Warnings'
        END as name,
        COUNT(*) as value
      FROM account
      GROUP BY nbr_warning
      ORDER BY nbr_warning ASC
    `);

    // 11. Flagged Providers
    const flaggedProviders = await query(`
      SELECT u.fname || ' ' || u.lname as name, 
             COALESCE((SELECT name FROM service_category sc2 
                       JOIN service s2 ON sc2.id_c = s2.id_c 
                       JOIN providing pr2 ON s2.id_s = pr2.id_s 
                       WHERE pr2.idu_sp = sp.idu_sp LIMIT 1), 'N/A') as category, 
             COUNT(DISTINCT r.id_reporter || r.id_reported) as reports, 
             a.nbr_warning as warnings,
             CASE 
               WHEN a.nbr_warning >= 2 THEN 'At Risk'
               WHEN a.nbr_warning = 1 THEN 'Caution'
               ELSE 'Safe'
             END as status
      FROM "user" u
      JOIN account a ON u.email = a.email
      JOIN service_provider sp ON u.id = sp.idu_sp
      LEFT JOIN report r ON u.email = r.id_reported
      WHERE a.nbr_warning > 0 OR r.id_reported IS NOT NULL
      GROUP BY u.id, a.nbr_warning, sp.idu_sp
      ORDER BY reports DESC, warnings DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        totalBookings: parseInt(totalBookings.rows[0].count),
        newClients: parseInt(newClients.rows[0].count),
        totalRevenue: parseFloat(totalRevenue.rows[0].sum || 0),
        activeProviders: parseInt(activeProviders.rows[0].count)
      },
      bookingsByPeriod: bookingsByPeriod.rows,
      clientsVsProviders: clientsByPeriod.rows.map(c => ({
        ...c,
        providers: providersByPeriod.rows.find(p => p.name === c.name)?.providers || 0
      })),
      revenueByPeriod: revenueTrend.rows,
      bookingsByService: bookingsByService.rows,
      ratingsByService: ratingsByService.rows,
      statusByService: statusByService.rows,
      revenueByService: revenueByService.rows,
      incidentsByPeriod: incidentsByPeriod.rows,
      incidentsByService: incidentsByService.rows,
      incidentsByReason: incidentsByReason.rows,
      warningDistribution: warningDistribution.rows,
      flaggedProviders: flaggedProviders.rows
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
