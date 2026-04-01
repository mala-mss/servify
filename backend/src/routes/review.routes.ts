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

const router = Router();

router.get('/', getAllReviews);
router.get('/provider/:providerId', getProviderReviews);
router.get('/stats/:providerId?', getReviewStats);

router.get('/:id', getReviewById);

router.post(
  '/',
  authenticate,
  validate([
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().withMessage('Comment is required'),
  ]),
  createReview
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ]),
  updateReview
);

router.delete('/:id', authenticate, deleteReview);

export default router;
