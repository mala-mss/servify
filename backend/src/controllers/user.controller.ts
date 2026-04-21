import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, Account } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search } = req.query;

  const where: any = {};
  if (search) {
    where[Op.or] = [
      { fname: { [Op.iLike]: \%\%\ } },
      { lname: { [Op.iLike]: \%\%\ } },
      { email: { [Op.iLike]: \%\%\ } }
    ];
  }

  const users = await User.findAll({
    where,
    include: [{ model: Account, as: 'account', attributes: ['status', 'nbr_warning'] }],
    order: [['created_at', 'DESC']],
  });

  res.json({ users });
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Account, as: 'account', attributes: ['status', 'nbr_warning'] }],
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ user });
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findOne({
    where: { email: req.user!.email },
    include: [{ model: Account, as: 'account', attributes: ['status', 'nbr_warning'] }],
  });

  res.json({ user });
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fname, lname, phone_number, address, profile_picture } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Permission check could be more robust
  const isAdmin = req.user!.role === 'admin';
  const isOwnProfile = req.user!.email === user.email;

  if (!isAdmin && !isOwnProfile) {
    throw new AppError('Unauthorized', 403);
  }

  await user.update({
    fname: fname !== undefined ? fname : user.fname,
    lname: lname !== undefined ? lname : user.lname,
    phone_number: phone_number !== undefined ? phone_number : user.phone_number,
    address: address !== undefined ? address : user.address,
    profile_picture: profile_picture !== undefined ? profile_picture : user.profile_picture,
  });

  res.json({
    message: 'User updated successfully',
    user
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

  // Deleting user will cascade delete account if set up correctly in DB
  await user.destroy();

  res.json({ message: 'User deleted successfully' });
};
