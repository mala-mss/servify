import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { searchProviders, getProviderById } from '../controllers/provider.controller';
import { 
  getAllUsers, getUserById, getCurrentUser, updateUser, deleteUser, 
  updateAccountStatus, warnUser, getClientProfile 
} from '../controllers/user.controller';
import { 
  getDependants, addDependant, updateDependant, deleteDependant,
  getMedicalInfo, updateMedicalInfo,
  getAuthorizedPeople, addAuthorizedPerson, updateAuthorizedPerson, removeAuthorizedPerson 
} from '../controllers/client.controller';

const router = Router();

router.get('/providers/search', asyncHandler(searchProviders));
router.get('/providers/:id', asyncHandler(getProviderById));

router.get('/clients/:id', authenticate, authorize('provider', 'admin'), asyncHandler(getClientProfile));

// Client-specific management
router.get('/dependants', authenticate, authorize('client'), asyncHandler(getDependants));
router.post('/dependants', authenticate, authorize('client'), asyncHandler(addDependant));
router.put('/dependants/:id', authenticate, authorize('client'), asyncHandler(updateDependant));
router.delete('/dependants/:id', authenticate, authorize('client'), asyncHandler(deleteDependant));

router.get('/dependants/:id/medical-info', authenticate, authorize('client'), asyncHandler(getMedicalInfo));
router.put('/dependants/:id/medical-info', authenticate, authorize('client'), asyncHandler(updateMedicalInfo));

router.get('/authorized-people', authenticate, authorize('client'), asyncHandler(getAuthorizedPeople));
router.post('/authorized-people', authenticate, authorize('client'), asyncHandler(addAuthorizedPerson));
router.put('/authorized-people/:id', authenticate, authorize('client'), asyncHandler(updateAuthorizedPerson));
router.delete('/authorized-people/:id', authenticate, authorize('client'), asyncHandler(removeAuthorizedPerson));

router.get('/', authenticate, authorize('admin'), asyncHandler(getAllUsers));

router.get('/me', authenticate, asyncHandler(getCurrentUser));

router.get('/:id', authenticate, asyncHandler(getUserById));

router.patch('/:id', authenticate, asyncHandler(updateUser));

router.delete('/:id', authenticate, authorize('admin'), asyncHandler(deleteUser));

router.patch('/:id/status', authenticate, authorize('admin'), asyncHandler(updateAccountStatus));

router.patch('/:id/warn', authenticate, authorize('admin'), asyncHandler(warnUser));

export default router;
