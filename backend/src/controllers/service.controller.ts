import { Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.query;

  try {
    let sql = `
      SELECT s.id_S as id_service, s.*, sc.name as category_name 
      FROM service s
      LEFT JOIN service_category sc ON s.id_C = sc.id_C
    `;
    const params: any[] = [];

    if (categoryId) {
      sql += ' WHERE s.id_C = $1';
      params.push(categoryId);
    }

    const result = await query(sql, params);
    res.json({ success: true, services: result.rows || [] });
  } catch (error: any) {
    console.error('Get all services error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT s.id_S as id_service, s.*, sc.name as category_name 
       FROM service s
       LEFT JOIN service_category sc ON s.id_C = sc.id_C
       WHERE s.id_S = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.json({ success: true, service: result.rows[0] });
  } catch (error: any) {
    console.error('Get service by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, base_price, id_C } = req.body;

  try {
    const result = await query(
      'INSERT INTO service (name, description, base_price, id_C) VALUES ($1, $2, $3, $4) RETURNING *, id_S as id_service',
      [name, description, base_price, id_C]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, base_price, id_C } = req.body;

  try {
    const result = await query(
      'UPDATE service SET name = COALESCE($1, name), description = COALESCE($2, description), base_price = COALESCE($3, base_price), id_C = COALESCE($4, id_C) WHERE id_S = $5 RETURNING *, id_S as id_service',
      [name, description, base_price, id_C, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM service WHERE id_S = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM service_category');
    res.json({ success: true, categories: result.rows || [] });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyServices = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.userId;  
  try {
    const result = await query(
      `SELECT s.id_S as id_service, s.*, sc.name as category_name
        FROM providing p
        JOIN service s ON p.id_S = s.id_S
        LEFT JOIN service_category sc ON s.id_C = sc.id_C
        WHERE p.idU_SP = $1`,
      [providerId]
    );
    res.json({ success: true, services: result.rows || [] });
  } catch (error: any) {  
      console.error('Get my services error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

