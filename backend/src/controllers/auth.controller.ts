import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';
import { jwtSecret, jwtExpiresIn, bcryptRounds } from '../config/auth.config';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, phone } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, bcryptRounds);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'client',
    phone,
    isActive: true,
    isVerified: false,
  });

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ user });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, address, bio, avatar } = req.body;
  const userId = req.params.id;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await user.update({
    name: name || user.name,
    phone: phone || user.phone,
    address: address || user.address,
    bio: bio || user.bio,
    avatar: avatar || user.avatar,
  });

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      bio: user.bio,
    },
  });
};
