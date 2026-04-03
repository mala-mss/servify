import { Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.query;

  try {
    let sql = `
      SELECT s.*, sc.name as category_name 
      FROM service s
      LEFT JOIN service_category sc ON s.category_id_fk = sc.id_category
    `;
    const params: any[] = [];

    if (categoryId) {
      sql += ' WHERE s.category_id_fk = $1';
      params.push(categoryId);
    }

    const result = await query(sql, params);
    res.json({ services: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT s.*, sc.name as category_name 
       FROM service s
       LEFT JOIN service_category sc ON s.category_id_fk = sc.id_category
       WHERE s.id_service = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    res.json({ service: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, base_price, category_id_fk } = req.body;

  try {
    const result = await query(
      'INSERT INTO service (name, description, base_price, category_id_fk) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, base_price, category_id_fk]
    );

    res.status(201).json({
      message: 'Service created successfully',
      service: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, base_price, category_id_fk } = req.body;

  try {
    const result = await query(
      'UPDATE service SET name = COALESCE($1, name), description = COALESCE($2, description), base_price = COALESCE($3, base_price), category_id_fk = COALESCE($4, category_id_fk) WHERE id_service = $5 RETURNING *',
      [name, description, base_price, category_id_fk, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    res.json({
      message: 'Service updated successfully',
      service: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM service WHERE id_service = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM service_category');
    res.json({ categories: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
