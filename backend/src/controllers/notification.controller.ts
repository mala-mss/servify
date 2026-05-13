import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';

export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const result = await query(
      `SELECT id, title, description, type, is_read, action_link, created_at
       FROM notification
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const unreadCountResult = await query(
      'SELECT COUNT(*) FROM notification WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      notifications: result.rows,
      unreadCount: parseInt(unreadCountResult.rows[0].count, 10)
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await query(
      `UPDATE notification
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, description, type, is_read, action_link, created_at`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    await query(
      'UPDATE notification SET is_read = true WHERE user_id = $1',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await query(
      'DELETE FROM notification WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    await query('DELETE FROM notification WHERE user_id = $1', [userId]);
    res.json({ message: 'All notifications deleted' });
  } catch (error: any) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/** Internal helper — call this from other controllers to push notifications */
export const createNotificationInternal = async (
  userId: number,
  title: string,
  description: string,
  type: string,
  actionLink: string | null = null
): Promise<void> => {
  try {
    await query(
      'INSERT INTO notification (user_id, title, description, type, action_link) VALUES ($1, $2, $3, $4, $5)',
      [userId, title, description, type, actionLink]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};