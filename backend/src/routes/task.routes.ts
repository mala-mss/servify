import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getProviderTasks,
  getClientTasks,
} from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(getAllTasks));
router.get('/provider/:providerId?', authenticate, asyncHandler(getProviderTasks));
router.get('/client/:clientId?', authenticate, asyncHandler(getClientTasks));

router.get('/:id', authenticate, asyncHandler(getTaskById));

router.post(
  '/',
  authenticate,
  validate([
    body('date').isISO8601().withMessage('Valid date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ]),
  asyncHandler(createTask)
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('status').optional().isIn(['pending', 'confirmed', 'in_progress', 'completed', 'declined', 'cancelled']).withMessage('Invalid status'),
  ]),
  asyncHandler(updateTask)
);

router.delete('/:id', authenticate, authorize('admin'), asyncHandler(deleteTask));

export default router;
