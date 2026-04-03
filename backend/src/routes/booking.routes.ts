import { Router } from 'express';
import {
  getBookings,
  getBookingStats,
  createBooking,
  updateBookingStatus,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getBookings));
router.get('/stats', asyncHandler(getBookingStats));
router.post('/', asyncHandler(createBooking));
router.put('/:id/status', asyncHandler(updateBookingStatus));

export default router;
