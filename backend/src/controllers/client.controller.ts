import { Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

/**
 * Get client ID from user ID
 */
const getClientId = async (userId: number): Promise<number> => {
  const result = await query('SELECT id_client FROM client WHERE user_id = ', [userId]);
  if (result.rows.length > 0) {
    return result.rows[0].id_client;
  }
  throw new AppError('Client account not found', 404);
};

// â
€â€ DEPENDANTS â€â€

export const getDependants = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.userId!);
  const result = await query('SELECT * FROM dependant WHERE client_id_fk = ', [clientId]);
  res.json({ success: true, dependants: result.rows });
};

export const addDependant = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.userId!);
  const { name, date_of_birth, relationship } = req.body;
  const result = await query(
    'INSERT INTO dependant (name, date_of_birth, relationship, client_id_fk) VALUES (, , , ) RETURNING *',
    [name, date_of_birth, relationship, clientId]
  );
  res.status(201).json({ success: true, dependant: result.rows[0] });
};

export const updateDependant = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.userId!);
  const { id } = req.params;
  const { name, date_of_birth, relationship } = req.body;
  const result = await query(
    'UPDATE dependant SET name = , date_of_birth = , relationship =  WHERE id_dependant =  AND client_id_fk =  RETURNING *',
    [name, date_of_birth, relationship, id, clientId]
  );
  res.json({ success: true, dependant: result.rows[0] });
};

export const deleteDependant = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.userId!);
  const { id } = req.params;
  await query('DELETE FROM dependant WHERE id_dependant =  AND client_id_fk = ', [id, clientId]);
  res.json({ success: true, message: 'Dependant deleted' });
};

// â€â€ MEDICAL INFO â€â€

export const getMedicalInfo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // dependant id
  const result = await query('SELECT * FROM medical_info WHERE dependent_id = ', [id]);
  res.json({ success: true, medicalInfo: result.rows[0] || {} });
};

export const updateMedicalInfo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // dependant id
  const { blood_type, allergies, medications, conditions } = req.body;

  const existing = await query('SELECT id FROM medical_info WHERE dependent_id = ', [id]);

  let result;
  if (existing.rows.length > 0) {
    result = await query(
      'UPDATE medical_info SET blood_type = , allergies = , medications = , conditions =  WHERE dependent_id =  RETURNING *',
      [blood_type, allergies, medications, conditions, id]
    );
  } else {
    result = await query(
      'INSERT INTO medical_info (blood_type, allergies, medications, conditions, dependent_id) VALUES (, , , , ) RETURNING *',
      [blood_type, allergies, medications, conditions, id]
    );
  }
  res.json({ success: true, medicalInfo: result.rows[0] });
};

// â€â€ AUTHORIZED PEOPLE â€â€

export const getAuthorizedPeople = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.userId!);
  const result = await query('SELECT * FROM authorized_person WHERE client_id = ', [clientId]);
  res.json({ success: true, authorizedPeople: result.rows });
};

export const updateAuthorizedPerson = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, phone_number, national_id } = req.body;
  const result = await query(
    'UPDATE authorized_person SET name = , phone_number = , national_id =  WHERE id =  RETURNING *',
    [name, phone_number, national_id, id]
  );
  res.json({ success: true, authorizedPerson: result.rows[0] });
};

export const addAuthorizedPerson = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.userId!);
  const { name, phone_number, national_id } = req.body;

  const result = await query(
    'INSERT INTO authorized_person (name, phone_number, national_id, client_id) VALUES (, , , ) RETURNING *',
    [name, phone_number, national_id, clientId]
  );
  res.status(201).json({ success: true, authorizedPerson: result.rows[0] });
};

export const removeAuthorizedPerson = async (req: AuthRequest, res: Response) => {
  const clientId = await getClientId(req.userId!);
  const { id } = req.params;
  await query('DELETE FROM authorized_person WHERE id =  AND client_id = ', [id, clientId]);
  res.json({ success: true, message: 'Authorized person removed' });
};
