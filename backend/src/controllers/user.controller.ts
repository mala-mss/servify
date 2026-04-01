import { Request, Response } from 'express';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    throw new AppError('Failed to fetch users', 500);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch user', 500);
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ['password'] },
    });

    res.json({ user });
  } catch (error) {
    throw new AppError('Failed to fetch current user', 500);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update user', 500);
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete user', 500);
  }
};
