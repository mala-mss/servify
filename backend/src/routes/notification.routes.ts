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
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(getAllNotifications));
router.get('/user/:userId?', authenticate, asyncHandler(getUserNotifications));
router.get('/unread/:userId?', authenticate, asyncHandler(getUnreadCount));

router.get('/:id', authenticate, asyncHandler(getNotificationById));

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
  asyncHandler(createNotification)
);

router.put('/:id/mark-as-read', authenticate, asyncHandler(markAsRead));
router.put('/:userId/mark-all-as-read', authenticate, asyncHandler(markAllAsRead));

router.delete('/:id', authenticate, asyncHandler(deleteNotification));

export default router;
