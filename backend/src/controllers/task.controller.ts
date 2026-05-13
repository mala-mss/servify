import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Task, User, Notification } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, idU_cl, idU_SP } = req.query;

  const where: any = {};
  if (status) where.status = status;
  if (idU_cl) where.idU_cl = idU_cl;
  if (idU_SP) where.idU_SP = idU_SP;

  const tasks = await Task.findAll({
    where,
    include: [
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture', 'phone_number'] },
      { model: User, as: 'provider', attributes: ['id', 'fname', 'lname', 'profile_picture', 'phone_number'] },
    ],
    order: [['start_time', 'DESC']],
  });

  res.json({ tasks });
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idT, idU_cl, idU_SP } = req.params;
  const task = await Task.findOne({
    where: { idT, idU_cl, idU_SP },
    include: [
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture', 'phone_number', 'email'] },
      { model: User, as: 'provider', attributes: ['id', 'fname', 'lname', 'profile_picture', 'phone_number', 'email'] },
    ],
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({ task });
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, start_time, end_time, duration, idU_cl, idU_SP } = req.body;
  
  const task = await Task.create({
    name: name || 'Service Task',
    start_time,
    end_time,
    duration,
    status: 'not_started',
    idU_cl,
    idU_SP,
  });

  await Notification.create({
    user_id: idU_SP,
    type: 'task',
    title: 'New Task Assigned',
    description: `You have a new task assigned to you`,
  });

  res.status(201).json({
    message: 'Task created successfully',
    task,
  });
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idT, idU_cl, idU_SP } = req.params;
  const { status, name, start_time, end_time, duration } = req.body;

  const task = await Task.findOne({ where: { idT, idU_cl, idU_SP } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (status) {
    task.status = status;
  }

  if (name) task.name = name;
  if (start_time) task.start_time = start_time;
  if (end_time) task.end_time = end_time;
  if (duration) task.duration = duration;

  await task.save();

  res.json({
    message: 'Task updated successfully',
    task,
  });
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idT, idU_cl, idU_SP } = req.params;

  const task = await Task.findOne({ where: { idT, idU_cl, idU_SP } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const isAdmin = req.user?.role === 'admin';
  if (!isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await task.destroy();

  res.json({ message: 'Task deleted successfully' });
};

export const getProviderTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const idU_SP = parseInt(req.params.providerId) || req.userId;

  const tasks = await Task.findAll({
    where: { idU_SP },
    include: [
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
    ],
    order: [['start_time', 'DESC']],
  });

  res.json({ tasks });
};

export const getClientTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const idU_cl = parseInt(req.params.clientId) || req.userId;

  const tasks = await Task.findAll({
    where: { idU_cl },
    include: [
      { model: User, as: 'provider', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
    ],
    order: [['start_time', 'DESC']],
  });

  res.json({ tasks });
};
