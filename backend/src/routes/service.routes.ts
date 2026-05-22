import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getCategories,
  getMyServices,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(getAllServices));
router.get('/categories', asyncHandler(getCategories));
router.post('/categories', authenticate, authorize('admin'), asyncHandler(createCategory));
router.put('/categories/:id', authenticate, authorize('admin'), asyncHandler(updateCategory));
router.delete('/categories/:id', authenticate, authorize('admin'), asyncHandler(deleteCategory));
router.get('/providers/my-services', authenticate, authorize('provider'), asyncHandler(getMyServices)); // For providers to get their services
router.get('/:id', asyncHandler(getServiceById));

router.post(
  '/',      
  authenticate,
  authorize('provider', 'admin'),
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('id_C').isInt().withMessage('Category ID must be an integer'),
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
