import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getUserTransactions,
  getTransactionSummary,
} from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.get('/', authenticate, getAllTransactions);
router.get('/user/:userId?', authenticate, getUserTransactions);
router.get('/summary/:userId/:type?', authenticate, getTransactionSummary);

router.get('/:id', authenticate, getTransactionById);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate([
    body('userId').isUUID().withMessage('Valid user ID is required'),
    body('type').isIn(['payment', 'payout', 'refund']).withMessage('Invalid transaction type'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  ]),
  createTransaction
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('status').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid status'),
  ]),
  updateTransaction
);

router.delete('/:id', authenticate, authorize('admin'), deleteTransaction);

export default router;
