import { Router } from 'express';
import {
  getBookings,
  getBookingStats,
  createBookingRequest,
  acceptBookingRequest,
  rejectBookingRequest,
  updateBookingStatus,
  getBookingRequests,
  getBookingById,
  requestFirstHalfPayment,
  requestSecondHalfPayment,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getBookings));
router.get('/requests', asyncHandler(getBookingRequests));
router.get('/stats', asyncHandler(getBookingStats));
router.get('/:id_B', asyncHandler(getBookingById));
router.post('/', asyncHandler(createBookingRequest));
router.post('/requests/:id_R/accept', asyncHandler(acceptBookingRequest));
router.post('/requests/:id_R/reject', asyncHandler(rejectBookingRequest));
router.post('/:id_B/payment/first-half', asyncHandler(requestFirstHalfPayment));
router.post('/:id_B/payment/second-half', asyncHandler(requestSecondHalfPayment));
router.put('/:id_B/status', asyncHandler(updateBookingStatus));

export default router;
