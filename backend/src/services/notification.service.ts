import { Notification } from '../models';

/**
 * Create a notification for a user
 */
export const createNotification = async (data: {
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'task' | 'system';
}): Promise<Notification> => {
  return await Notification.create(data);
};

/**
 * Create multiple notifications (batch)
 */
export const createBatchNotifications = async (
  notifications: Array<{
    user_id: string;
    title: string;
    message: string;
    type: 'booking' | 'payment' | 'task' | 'system';
  }>
): Promise<Notification[]> => {
  return await Notification.bulkCreate(notifications);
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string, userId: string): Promise<Notification | null> => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      user_id: userId,
    },
  });

  if (!notification) {
    return null;
  }

  await notification.update({ is_read: true });
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string): Promise<number> => {
  const [affectedCount] = await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } }
  );
  return affectedCount;
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return await Notification.count({
    where: { user_id: userId, is_read: false },
  });
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string, userId: string): Promise<boolean> => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      user_id: userId,
    },
  });

  if (!notification) {
    return false;
  }

  await notification.destroy();
  return true;
};

/**
 * Send booking-related notification
 */
export const sendBookingNotification = async (
  userId: string,
  bookingId: string,
  action: 'created' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
): Promise<Notification> => {
  const titles = {
    created: 'New Booking',
    accepted: 'Booking Accepted',
    rejected: 'Booking Rejected',
    completed: 'Booking Completed',
    cancelled: 'Booking Cancelled',
  };

  const messages = {
    created: `A new booking has been created (ID: ${bookingId}).`,
    accepted: `Your booking (ID: ${bookingId}) has been accepted.`,
    rejected: `Your booking (ID: ${bookingId}) has been rejected.`,
    completed: `Your booking (ID: ${bookingId}) has been completed.`,
    cancelled: `Your booking (ID: ${bookingId}) has been cancelled.`,
  };

  return await createNotification({
    user_id: userId,
    title: titles[action],
    message: messages[action],
    type: 'booking',
  });
};

/**
 * Send payment-related notification
 */
export const sendPaymentNotification = async (
  userId: string,
  paymentId: string,
  action: 'created' | 'completed' | 'failed'
): Promise<Notification> => {
  const titles = {
    created: 'Payment Received',
    completed: 'Payment Completed',
    failed: 'Payment Failed',
  };

  const messages = {
    created: `A new payment has been recorded (ID: ${paymentId}).`,
    completed: `Your payment (ID: ${paymentId}) has been completed successfully.`,
    failed: `Your payment (ID: ${paymentId}) has failed. Please try again.`,
  };

  return await createNotification({
    user_id: userId,
    title: titles[action],
    message: messages[action],
    type: 'payment',
  });
};
