import { Router } from 'express';
import {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getProviderSchedule,
  checkAvailability,
} from '../controllers/schedule.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(getAllSchedules));
router.get('/provider/:providerId?', asyncHandler(getProviderSchedule));
router.get('/check-availability', asyncHandler(checkAvailability));

router.get('/:id', asyncHandler(getScheduleById));

router.post(
  '/',
  authenticate,
  validate([
    body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
  ]),
  asyncHandler(createSchedule)
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
  ]),
  asyncHandler(updateSchedule)
);

router.delete('/:id', authenticate, asyncHandler(deleteSchedule));

export default router;
