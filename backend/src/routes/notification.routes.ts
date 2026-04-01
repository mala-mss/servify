import { Router } from 'express';
import {
  getAllNotifications,
  getNotificationById,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount,
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.get('/', authenticate, getAllNotifications);
router.get('/user/:userId?', authenticate, getUserNotifications);
router.get('/unread/:userId?', authenticate, getUnreadCount);

router.get('/:id', authenticate, getNotificationById);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate([
    body('userId').isUUID().withMessage('Valid user ID is required'),
    body('type').isIn(['booking', 'job', 'payment', 'review', 'system']).withMessage('Invalid notification type'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ]),
  createNotification
);

router.put('/:id/mark-as-read', authenticate, markAsRead);
router.put('/:userId/mark-all-as-read', authenticate, markAllAsRead);

router.delete('/:id', authenticate, deleteNotification);

export default router;
