import { Request, Response } from 'express';
import { Notification, User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    throw new AppError('Failed to fetch notifications', 500);
  }
};

export const getNotificationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.json({ notification });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch notification', 500);
  }
};

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    throw new AppError('Failed to fetch user notifications', 500);
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to mark notification as read', 500);
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user!.id;

    await Notification.update(
      { isRead: true },
      { where: { userId } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    throw new AppError('Failed to mark notifications as read', 500);
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete notification', 500);
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    throw new AppError('Failed to create notification', 500);
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user!.id;

    const count = await Notification.count({
      where: { userId, isRead: false },
    });

    res.json({ count });
  } catch (error) {
    throw new AppError('Failed to get unread count', 500);
  }
};
