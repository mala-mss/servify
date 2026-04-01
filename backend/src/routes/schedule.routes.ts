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

const router = Router();

router.get('/', getAllSchedules);
router.get('/provider/:providerId?', getProviderSchedule);
router.get('/check-availability', checkAvailability);

router.get('/:id', getScheduleById);

router.post(
  '/',
  authenticate,
  validate([
    body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
  ]),
  createSchedule
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
  ]),
  updateSchedule
);

router.delete('/:id', authenticate, deleteSchedule);

export default router;
