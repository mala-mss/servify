import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models';
import { authenticate, authorize } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

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
