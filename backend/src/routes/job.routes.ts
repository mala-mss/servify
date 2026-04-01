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

const router = Router();

router.get('/', authenticate, getAllJobs);
router.get('/provider/:providerId?', authenticate, getProviderJobs);
router.get('/client/:clientId?', authenticate, getClientJobs);

router.get('/:id', authenticate, getJobById);

router.post(
  '/',
  authenticate,
  validate([
    body('date').isISO8601().withMessage('Valid date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ]),
  createJob
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('status').optional().isIn(['pending', 'confirmed', 'in_progress', 'completed', 'declined', 'cancelled']).withMessage('Invalid status'),
  ]),
  updateJob
);

router.delete('/:id', authenticate, authorize('admin'), deleteJob);

export default router;
