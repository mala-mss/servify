import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';

export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId || req.user?.id;

  try {
    const result = await query(
      'SELECT * FROM notification WHERE user_id = $1 ORDER BY created_at DESC',
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
      'UPDATE notification SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (error: any) {
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
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await query(
      'DELETE FROM notification WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createNotificationInternal = async (userId: number, title: string, description: string, type: string) => {
  try {
    await query(
      'INSERT INTO notification (user_id, title, description, type) VALUES ($1, $2, $3, $4)',
      [userId, title, description, type]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};
