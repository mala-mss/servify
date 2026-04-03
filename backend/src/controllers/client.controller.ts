import { Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

/**
 * Get client ID from user ID, creating it if it doesn't exist for a 'client' user
 */
const getClientId = async (userId: number): Promise<number> => {
  const result = await query('SELECT id_client FROM client WHERE user_id = $1', [userId]);
  if (result.rows.length > 0) {
    return result.rows[0].id_client;
  }
  
  // Check if user has client role
  const userResult = await query('SELECT role FROM "user" WHERE id = $1', [userId]);
  if (userResult.rows.length > 0 && userResult.rows[0].role === 'client') {
    const insertResult = await query('INSERT INTO client (user_id) VALUES ($1) RETURNING id_client', [userId]);
    return insertResult.rows[0].id_client;
  }

  throw new AppError('Client account not found and user is not a client', 404);
};

// ── DEPENDANTS ──

export const getDependants = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.user!.id);
  const result = await query('SELECT * FROM dependant WHERE client_id_fk = $1', [clientId]);
  res.json({ success: true, dependants: result.rows });
};

export const addDependant = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.user!.id);
  const { name, date_of_birth, relationship } = req.body;
  const result = await query(
    'INSERT INTO dependant (name, date_of_birth, relationship, client_id_fk) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, date_of_birth, relationship, clientId]
  );
  res.status(201).json({ success: true, dependant: result.rows[0] });
};

export const updateDependant = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.user!.id);
  const { id } = req.params;
  const { name, date_of_birth, relationship } = req.body;
  const result = await query(
    'UPDATE dependant SET name = $1, date_of_birth = $2, relationship = $3 WHERE id_dependant = $4 AND client_id_fk = $5 RETURNING *',
    [name, date_of_birth, relationship, id, clientId]
  );
  res.json({ success: true, dependant: result.rows[0] });
};

export const deleteDependant = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.user!.id);
  const { id } = req.params;
  await query('DELETE FROM dependant WHERE id_dependant = $1 AND client_id_fk = $2', [id, clientId]);
  res.json({ success: true, message: 'Dependant deleted' });
};

// ── MEDICAL INFO ──

export const getMedicalInfo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // dependant id
  const result = await query('SELECT * FROM medical_info WHERE dependent_id = $1', [id]);
  res.json({ success: true, medicalInfo: result.rows[0] || {} });
};

export const updateMedicalInfo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // dependant id
  const { blood_type, allergies, medications, conditions } = req.body;
  
  const existing = await query('SELECT id FROM medical_info WHERE dependent_id = $1', [id]);
  
  let result;
  if (existing.rows.length > 0) {
    result = await query(
      'UPDATE medical_info SET blood_type = $1, allergies = $2, medications = $3, conditions = $4 WHERE dependent_id = $5 RETURNING *',
      [blood_type, allergies, medications, conditions, id]
    );
  } else {
    result = await query(
      'INSERT INTO medical_info (blood_type, allergies, medications, conditions, dependent_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [blood_type, allergies, medications, conditions, id]
    );
  }
  res.json({ success: true, medicalInfo: result.rows[0] });
};

// ── AUTHORIZED PEOPLE ──

export const getAuthorizedPeople = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.user!.id);
  const result = await query(`
    SELECT ap.* FROM authorized_person ap
    JOIN client_authorized_person cap ON ap.id = cap.authorized_person_id
    WHERE cap.client_id = $1
  `, [clientId]);
  res.json({ success: true, authorizedPeople: result.rows });
};

export const updateAuthorizedPerson = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, phone_number, national_id } = req.body;
  const result = await query(
    'UPDATE authorized_person SET name = $1, phone_number = $2, national_id = $3 WHERE id = $4 RETURNING *',
    [name, phone_number, national_id, id]
  );
  res.json({ success: true, authorizedPerson: result.rows[0] });
};

export const addAuthorizedPerson = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.user!.id);
  const { name, phone_number, national_id } = req.body;
  
  // Start transaction
  await query('BEGIN');
  try {
    const personResult = await query(
      'INSERT INTO authorized_person (name, phone_number, national_id) VALUES ($1, $2, $3) RETURNING *',
      [name, phone_number, national_id]
    );
    const personId = personResult.rows[0].id;
    await query(
      'INSERT INTO client_authorized_person (client_id, authorized_person_id) VALUES ($1, $2)',
      [clientId, personId]
    );
    await query('COMMIT');
    res.status(201).json({ success: true, authorizedPerson: personResult.rows[0] });
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
};

export const removeAuthorizedPerson = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.user!.id);
  const { id } = req.params;
  await query('DELETE FROM client_authorized_person WHERE client_id = $1 AND authorized_person_id = $2', [clientId, id]);
  // Optional: Delete from authorized_person if not linked to others
  res.json({ success: true, message: 'Authorization removed' });
};
