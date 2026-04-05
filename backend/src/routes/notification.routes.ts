import { Router } from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getUserNotifications));
router.put('/:id/mark-as-read', asyncHandler(markAsRead));
router.put('/mark-all-as-read', asyncHandler(markAllAsRead));
router.delete('/:id', asyncHandler(deleteNotification));

export default router;
