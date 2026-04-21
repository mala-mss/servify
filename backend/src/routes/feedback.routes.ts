import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getProviderFeedbacks,
  getFeedbackStats,
} from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(getAllFeedbacks));
router.get('/provider/:providerId', asyncHandler(getProviderFeedbacks));
router.get('/stats/:providerId?', asyncHandler(getFeedbackStats));

router.get('/:id', asyncHandler(getFeedbackById));

router.post(
  '/',
  authenticate,
  validate([
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().withMessage('Comment is required'),
  ]),
  asyncHandler(createFeedback)
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ]),
  asyncHandler(updateFeedback)
);

router.delete('/:id', authenticate, asyncHandler(deleteFeedback));

export default router;
