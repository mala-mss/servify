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

const router = Router();

router.get('/', authenticate, getAllBookings);
router.get('/client/:clientId', getClientBookings);
router.get('/provider/:providerId', getProviderBookings);

router.get('/:id', authenticate, getBookingById);

router.post(
  '/',
  authenticate,
  validate([
    body('serviceId').isUUID().withMessage('Valid service ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ]),
  createBooking
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
  ]),
  updateBooking
);

router.delete('/:id', authenticate, deleteBooking);

export default router;
