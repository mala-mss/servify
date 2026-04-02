import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Schedule, User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  const { providerId, dayOfWeek } = req.query;

  const where: any = {};
  if (providerId) where.providerId = providerId;
  if (dayOfWeek) where.dayOfWeek = parseInt(dayOfWeek as string, 10);

  const schedules = await Schedule.findAll({
    where,
    include: [
      { model: User, as: 'provider', attributes: ['id', 'name', 'avatar'] },
    ],
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
  });

  res.json({ schedules });
};

export const getScheduleById = async (req: AuthRequest, res: Response): Promise<void> => {
  const schedule = await Schedule.findByPk(req.params.id, {
    include: [
      { model: User, as: 'provider', attributes: ['id', 'name', 'avatar'] },
    ],
  });

  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }

  res.json({ schedule });
};

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { dayOfWeek, startTime, endTime, isAvailable, title, color } = req.body;
  const providerId = req.user!.id;

  const schedule = await Schedule.create({
    providerId,
    dayOfWeek,
    startTime,
    endTime,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    title,
    color,
  });

  res.status(201).json({
    message: 'Schedule created successfully',
    schedule,
  });
};

export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { dayOfWeek, startTime, endTime, isAvailable, title, color } = req.body;

  const schedule = await Schedule.findByPk(id);
  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (schedule.providerId !== req.user!.id && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await schedule.update({
    dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : schedule.dayOfWeek,
    startTime: startTime || schedule.startTime,
    endTime: endTime || schedule.endTime,
    isAvailable: isAvailable !== undefined ? isAvailable : schedule.isAvailable,
    title: title !== undefined ? title : schedule.title,
    color: color !== undefined ? color : schedule.color,
  });

  res.json({
    message: 'Schedule updated successfully',
    schedule,
  });
};

export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const schedule = await Schedule.findByPk(id);
  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (schedule.providerId !== req.user!.id && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await schedule.destroy();

  res.json({ message: 'Schedule deleted successfully' });
};

export const getProviderSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.params.providerId || req.user!.id;

  const schedules = await Schedule.findAll({
    where: { providerId },
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
  });

  const weekSchedule = {
    0: schedules.filter(s => s.dayOfWeek === 0),
    1: schedules.filter(s => s.dayOfWeek === 1),
    2: schedules.filter(s => s.dayOfWeek === 2),
    3: schedules.filter(s => s.dayOfWeek === 3),
    4: schedules.filter(s => s.dayOfWeek === 4),
    5: schedules.filter(s => s.dayOfWeek === 5),
    6: schedules.filter(s => s.dayOfWeek === 6),
  };

  res.json({ schedules: weekSchedule });
};

export const checkAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const { providerId, date, time } = req.query;

  if (!providerId || !date || !time) {
    throw new AppError('providerId, date, and time are required', 400);
  }

  const targetDate = new Date(date as string);
  const dayOfWeek = targetDate.getDay();
  const timeStr = time as string;

  const schedules = await Schedule.findAll({
    where: {
      providerId: providerId as string,
      dayOfWeek,
      isAvailable: true,
    },
  });

  const isAvailable = schedules.some(schedule => {
    return timeStr >= schedule.startTime && timeStr <= schedule.endTime;
  });

  res.json({
    available: isAvailable,
    dayOfWeek,
    schedules,
  });
};
