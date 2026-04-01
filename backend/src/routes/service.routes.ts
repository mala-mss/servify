import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getProviderServices,
} from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.get('/', getAllServices);
router.get('/provider/:providerId', getProviderServices);

router.get('/:id', getServiceById);

router.post(
  '/',
  authenticate,
  authorize('provider', 'admin'),
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ]),
  createService
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ]),
  updateService
);

router.delete('/:id', authenticate, deleteService);

export default router;
