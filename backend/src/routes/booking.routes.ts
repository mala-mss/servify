import { Router } from 'express';
import {
  getBookings,
  getBookingStats,
  createBookingRequest,
  acceptBookingRequest,
  rejectBookingRequest,
  updateBookingStatus,
  getBookingRequests,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getBookings));
router.get('/requests', asyncHandler(getBookingRequests));
router.get('/stats', asyncHandler(getBookingStats));
router.post('/', asyncHandler(createBookingRequest));
router.post('/requests/:id_R/accept', asyncHandler(acceptBookingRequest));
router.post('/requests/:id_R/reject', asyncHandler(rejectBookingRequest));
router.put('/:id_B/:idU_cl/:idU_SP/status', asyncHandler(updateBookingStatus));

export default router;
