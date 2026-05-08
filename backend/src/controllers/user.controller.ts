import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';

const USER_FIELDS = `
  u.id, u.fname, u.lname, u.email, u.phone_number,
  u.address, u.profile_picture, u.created_at, u.updated_at,
  a.status, a.nbr_warning
`;

const USER_JOIN = `
  FROM "user" u
  LEFT JOIN account a ON a.email = u.email
`;

// ── GET /users  (admin only) ──────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search } = req.query;

  try {
    const params: any[] = [];
    let whereClause = '';

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE u.fname ILIKE $1 OR u.lname ILIKE $1 OR u.email ILIKE $1`;
    }

    const result = await query(
      `SELECT ${USER_FIELDS} ${USER_JOIN} ${whereClause} ORDER BY u.created_at DESC`,
      params
    );

    res.json({ success: true, users: result.rows });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /users/:id ────────────────────────────────────────────
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT ${USER_FIELDS} ${USER_JOIN} WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Resolve role
    const user = result.rows[0];
    user.role = await resolveRole(parseInt(id));

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /users/me ─────────────────────────────────────────────
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const result = await query(
      `SELECT ${USER_FIELDS} ${USER_JOIN} WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];
    user.role = await resolveRole(userId!);

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── PATCH /users/:id ──────────────────────────────────────────
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fname, lname, phone_number, address, profile_picture } = req.body;

  const isAdmin    = req.user?.role === 'admin';
  const isOwnProfile = req.userId === parseInt(id);

  if (!isAdmin && !isOwnProfile) {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const result = await query(
      `UPDATE "user"
       SET fname           = COALESCE($1, fname),
           lname           = COALESCE($2, lname),
           phone_number    = COALESCE($3, phone_number),
           address         = COALESCE($4, address),
           profile_picture = COALESCE($5, profile_picture),
           updated_at      = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, fname, lname, email, phone_number, address, profile_picture, updated_at`,
      [fname ?? null, lname ?? null, phone_number ?? null, address ?? null, profile_picture ?? null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── DELETE /users/:id  (admin only) ──────────────────────────
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Deleting from "user" cascades to account if FK is set with ON DELETE CASCADE,
    // otherwise delete account first to avoid FK constraint violation
    await query('DELETE FROM account WHERE email = (SELECT email FROM "user" WHERE id = $1)', [id]);

    const result = await query(
      'DELETE FROM "user" WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── PATCH /users/:id/status  (admin only) ────────────────────
export const updateAccountStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'inactive' | 'suspended'

  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const result = await query(
      `UPDATE account
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE email = (SELECT email FROM "user" WHERE id = $2)
       RETURNING email, status, nbr_warning`,
      [status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    res.json({ message: 'Account status updated', account: result.rows[0] });
  } catch (error: any) {
    console.error('Update account status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── PATCH /users/:id/warn  (admin only) ──────────────────────
export const warnUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const result = await query(
      `UPDATE account
       SET nbr_warning = nbr_warning + 1, updated_at = CURRENT_TIMESTAMP
       WHERE email = (SELECT email FROM "user" WHERE id = $1)
       RETURNING email, status, nbr_warning`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    res.json({ message: 'Warning issued', account: result.rows[0] });
  } catch (error: any) {
    console.error('Warn user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── Internal helper ───────────────────────────────────────────
async function resolveRole(userId: number): Promise<string> {
  const adminCheck = await query('SELECT idu_a FROM admin WHERE idu_a = $1', [userId]);
  if (adminCheck.rows.length > 0) return 'admin';

  const providerCheck = await query('SELECT idu_sp FROM service_provider WHERE idu_sp = $1', [userId]);
  if (providerCheck.rows.length > 0) return 'provider';

  return 'client';
}