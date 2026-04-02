import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getClientBookings,
  getProviderBookings,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(getAllBookings));
router.get('/client/:clientId', asyncHandler(getClientBookings));
router.get('/provider/:providerId', asyncHandler(getProviderBookings));

router.get('/:id', authenticate, asyncHandler(getBookingById));

router.post(
  '/',
  authenticate,
  validate([
    body('serviceId').isUUID().withMessage('Valid service ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ]),
  asyncHandler(createBooking)
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
  ]),
  asyncHandler(updateBooking)
);

router.delete('/:id', authenticate, asyncHandler(deleteBooking));

export default router;
