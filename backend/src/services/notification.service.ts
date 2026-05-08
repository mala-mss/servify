import { query } from '../db';
import type { Notification } from '../types';

// ── Core helpers ──────────────────────────────────────────────

export const createNotification = async (data: {
  user_id: number;
  title: string;
  description: string;  // DB column is "description", not "message"
  type: string;
}): Promise<Notification> => {
  const result = await query(
    `INSERT INTO notification (user_id, title, description, type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.user_id, data.title, data.description, data.type]
  );
  return result.rows[0];
};

export const createBatchNotifications = async (
  notifications: Array<{
    user_id: number;
    title: string;
    description: string;
    type: string;
  }>
): Promise<Notification[]> => {
  if (notifications.length === 0) return [];

  // Build a single multi-row INSERT for efficiency
  const values: any[] = [];
  const placeholders = notifications.map((n, i) => {
    const base = i * 4;
    values.push(n.user_id, n.title, n.description, n.type);
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  });

  const result = await query(
    `INSERT INTO notification (user_id, title, description, type)
     VALUES ${placeholders.join(', ')}
     RETURNING *`,
    values
  );
  return result.rows;
};

export const markAsRead = async (notificationId: number, userId: number): Promise<Notification | null> => {
  const result = await query(
    `UPDATE notification SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return result.rows[0] ?? null;
};

export const markAllAsRead = async (userId: number): Promise<number> => {
  const result = await query(
    `UPDATE notification SET is_read = true
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return result.rowCount ?? 0;
};

export const getUnreadCount = async (userId: number): Promise<number> => {
  const result = await query(
    'SELECT COUNT(*) FROM notification WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};

export const deleteNotification = async (notificationId: number, userId: number): Promise<boolean> => {
  const result = await query(
    'DELETE FROM notification WHERE id = $1 AND user_id = $2 RETURNING id',
    [notificationId, userId]
  );
  return (result.rowCount ?? 0) > 0;
};

// ── Domain-specific senders ───────────────────────────────────

type BookingAction = 'created' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
type PaymentAction = 'created' | 'completed' | 'failed';
type TaskAction    = 'assigned' | 'started' | 'completed';

export const sendBookingNotification = async (
  userId: number,
  bookingId: number,
  action: BookingAction
): Promise<Notification> => {
  const map: Record<BookingAction, { title: string; description: string }> = {
    created:   { title: 'New Booking',       description: `A new booking has been created (#${bookingId}).` },
    accepted:  { title: 'Booking Accepted',  description: `Your booking (#${bookingId}) has been accepted.` },
    rejected:  { title: 'Booking Rejected',  description: `Your booking (#${bookingId}) has been rejected.` },
    completed: { title: 'Booking Completed', description: `Your booking (#${bookingId}) has been completed.` },
    cancelled: { title: 'Booking Cancelled', description: `Your booking (#${bookingId}) has been cancelled.` },
  };

  return createNotification({ user_id: userId, type: 'booking', ...map[action] });
};

export const sendPaymentNotification = async (
  userId: number,
  paymentId: number,
  action: PaymentAction
): Promise<Notification> => {
  const map: Record<PaymentAction, { title: string; description: string }> = {
    created:   { title: 'Payment Received',  description: `A new payment has been recorded (#${paymentId}).` },
    completed: { title: 'Payment Completed', description: `Your payment (#${paymentId}) was completed successfully.` },
    failed:    { title: 'Payment Failed',    description: `Your payment (#${paymentId}) failed. Please try again.` },
  };

  return createNotification({ user_id: userId, type: 'payment', ...map[action] });
};

export const sendTaskNotification = async (
  userId: number,
  taskId: number,
  action: TaskAction
): Promise<Notification> => {
  const map: Record<TaskAction, { title: string; description: string }> = {
    assigned:  { title: 'Task Assigned',   description: `A new task has been assigned to you (#${taskId}).` },
    started:   { title: 'Task Started',    description: `Task #${taskId} has been started.` },
    completed: { title: 'Task Completed',  description: `Task #${taskId} has been marked as completed.` },
  };

  return createNotification({ user_id: userId, type: 'task', ...map[action] });
};