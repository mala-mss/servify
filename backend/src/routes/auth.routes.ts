import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post(
  '/register',
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['client', 'provider', 'admin', 'authorized']).withMessage('Invalid role'),
  ]),
  asyncHandler(register)
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  asyncHandler(login)
);

router.get('/:id', authenticate, asyncHandler(getProfile));
router.put('/:id', authenticate, asyncHandler(updateProfile));

export default router;
