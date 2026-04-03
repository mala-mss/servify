import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getCategories,
} from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(getAllServices));
router.get('/categories', asyncHandler(getCategories));
router.get('/:id', asyncHandler(getServiceById));

router.post(
  '/',
  authenticate,
  authorize('provider', 'admin'),
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('category_id_fk').isInt().withMessage('Category ID must be an integer'),
  ]),
  asyncHandler(createService)
);

router.put(
  '/:id',
  authenticate,
  authorize('provider', 'admin'),
  asyncHandler(updateService)
);

router.delete('/:id', authenticate, authorize('provider', 'admin'), asyncHandler(deleteService));

export default router;
