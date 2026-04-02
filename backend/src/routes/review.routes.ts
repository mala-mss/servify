import { Router } from 'express';
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getProviderReviews,
  getReviewStats,
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(getAllReviews));
router.get('/provider/:providerId', asyncHandler(getProviderReviews));
router.get('/stats/:providerId?', asyncHandler(getReviewStats));

router.get('/:id', asyncHandler(getReviewById));

router.post(
  '/',
  authenticate,
  validate([
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().withMessage('Comment is required'),
  ]),
  asyncHandler(createReview)
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ]),
  asyncHandler(updateReview)
);

router.delete('/:id', authenticate, asyncHandler(deleteReview));

export default router;
