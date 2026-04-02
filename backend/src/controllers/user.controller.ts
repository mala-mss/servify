import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { role, isActive, search } = req.query;

  const where: any = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where.name = { [require('sequelize').Op.iLike]: `%${search}%` };
  }

  const users = await User.findAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });

  res.json({ users });
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ user });
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByPk(req.user!.id, {
    attributes: { exclude: ['password'] },
  });

  res.json({ user });
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, phone, address, bio, avatar, isActive, isVerified } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  const isOwnProfile = req.user!.id === id;

  if (!isAdmin && !isOwnProfile) {
    throw new AppError('Unauthorized', 403);
  }

  await user.update({
    name: name !== undefined ? name : user.name,
    phone: phone !== undefined ? phone : user.phone,
    address: address !== undefined ? address : user.address,
    bio: bio !== undefined ? bio : user.bio,
    avatar: avatar !== undefined ? avatar : user.avatar,
    isActive: isAdmin && isActive !== undefined ? isActive : user.isActive,
    isVerified: isAdmin && isVerified !== undefined ? isVerified : user.isVerified,
  });

  res.json({
    message: 'User updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      bio: user.bio,
      isActive: user.isActive,
      isVerified: user.isVerified,
    },
  });
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (req.user!.role !== 'admin') {
    throw new AppError('Unauthorized', 403);
  }

  await user.destroy();

  res.json({ message: 'User deleted successfully' });
};
