import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification, User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId, type, isRead } = req.query;

  const where: any = {};
  if (userId) where.userId = userId;
  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const notifications = await Notification.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 100,
  });

  res.json({ notifications });
};

export const getNotificationById = async (req: AuthRequest, res: Response): Promise<void> => {
  const notification = await Notification.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
    ],
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.json({ notification });
};

export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId || req.user!.id;
  const { isRead, limit } = req.query;

  const where: any = { userId };
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const notifications = await Notification.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit as string, 10) || 50,
  });

  const unreadCount = await Notification.count({
    where: { userId, isRead: false },
  });

  res.json({
    notifications,
    unreadCount,
  });
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.userId !== req.user!.id && req.user!.role !== 'admin') {
    throw new AppError('Unauthorized', 403);
  }

  await notification.update({ isRead: true });

  res.json({ message: 'Notification marked as read', notification });
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId || req.user!.id;

  await Notification.update(
    { isRead: true },
    { where: { userId } }
  );

  res.json({ message: 'All notifications marked as read' });
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.userId !== req.user!.id && req.user!.role !== 'admin') {
    throw new AppError('Unauthorized', 403);
  }

  await notification.destroy();

  res.json({ message: 'Notification deleted successfully' });
};

export const createNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId, type, priority, title, message, data } = req.body;

  const notification = await Notification.create({
    userId,
    type,
    priority: priority || 'medium',
    title,
    message,
    data,
    isRead: false,
  });

  res.status(201).json({
    message: 'Notification created successfully',
    notification,
  });
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId || req.user!.id;

  const count = await Notification.count({
    where: { userId, isRead: false },
  });

  res.json({ count });
};
