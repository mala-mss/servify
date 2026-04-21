import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getUserTransactions,
  getTransactionSummary,
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(getAllTransactions));
router.get('/user/:userId?', authenticate, asyncHandler(getUserTransactions));
router.get('/summary/:userId/:type?', authenticate, asyncHandler(getTransactionSummary));

router.get('/:id', authenticate, asyncHandler(getTransactionById));

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate([
    body('userId').isUUID().withMessage('Valid user ID is required'),
    body('type').isIn(['payment', 'payout', 'refund']).withMessage('Invalid transaction type'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  ]),
  asyncHandler(createTransaction)
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('status').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid status'),
  ]),
  asyncHandler(updateTransaction)
);

router.delete('/:id', authenticate, authorize('admin'), asyncHandler(deleteTransaction));

export default router;
