import { Router } from 'express';
import {
  getProviderDashboard,
  getProviderServices,
  addProviderService,
  deleteProviderService,
  searchProviders,
  getProviderById,
  getProviderEarnings,
  getMyProviderProfile,
  updateProviderProfile
} from '../controllers/provider.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Public routes
router.get('/search', asyncHandler(searchProviders));
router.get('/:id', asyncHandler(getProviderById));

// Protected provider routes
router.get('/dashboard', authenticate, authorize('provider'), asyncHandler(getProviderDashboard));
router.get('/my-services', authenticate, authorize('provider'), asyncHandler(getProviderServices));
router.post('/my-services', authenticate, authorize('provider'), asyncHandler(addProviderService));
router.delete('/my-services/:id', authenticate, authorize('provider'), asyncHandler(deleteProviderService));
router.get('/earnings', authenticate, authorize('provider'), asyncHandler(getProviderEarnings));
router.get('/profile', authenticate, authorize('provider'), asyncHandler(getMyProviderProfile));
router.put('/profile', authenticate, authorize('provider'), asyncHandler(updateProviderProfile));

export default router;
