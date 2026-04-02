import { Router } from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getProviderJobs,
  getClientJobs,
} from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(getAllJobs));
router.get('/provider/:providerId?', authenticate, asyncHandler(getProviderJobs));
router.get('/client/:clientId?', authenticate, asyncHandler(getClientJobs));

router.get('/:id', authenticate, asyncHandler(getJobById));

router.post(
  '/',
  authenticate,
  validate([
    body('date').isISO8601().withMessage('Valid date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ]),
  asyncHandler(createJob)
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('status').optional().isIn(['pending', 'confirmed', 'in_progress', 'completed', 'declined', 'cancelled']).withMessage('Invalid status'),
  ]),
  asyncHandler(updateJob)
);

router.delete('/:id', authenticate, authorize('admin'), asyncHandler(deleteJob));

export default router;
