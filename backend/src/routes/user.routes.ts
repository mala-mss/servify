import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models';
import { authenticate, authorize } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { searchProviders, getProviderById } from '../controllers/provider.controller';
import { 
  getDependants, addDependant, updateDependant, deleteDependant,
  getMedicalInfo, updateMedicalInfo,
  getAuthorizedPeople, addAuthorizedPerson, updateAuthorizedPerson, removeAuthorizedPerson 
} from '../controllers/client.controller';

const router = Router();

router.get('/providers/search', asyncHandler(searchProviders));
router.get('/providers/:id', asyncHandler(getProviderById));

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

router.get('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { role, isActive } = req.query;

  const where: any = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const users = await User.findAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });

  res.json({ users });
}));

router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findByPk(req.user!.id, {
    attributes: { exclude: ['password'] },
  });

  res.json({ user });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ user });
}));

export default router;
