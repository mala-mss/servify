import { Request, Response } from 'express';
import { Schedule, User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    throw new AppError('Failed to fetch schedules', 500);
  }
};

export const getScheduleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findByPk(req.params.id, {
      include: [
        { model: User, as: 'provider', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    res.json({ schedule });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch schedule', 500);
  }
};

export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    throw new AppError('Failed to create schedule', 500);
  }
};

export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update schedule', 500);
  }
};

export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete schedule', 500);
  }
};

export const getProviderSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    throw new AppError('Failed to fetch provider schedule', 500);
  }
};

export const checkAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId, date, time } = req.query;

    if (!providerId || !date || !time) {
      throw new AppError('providerId, date, and time are required', 400);
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay();
    const timeStr = time as string;

    const schedules = await Schedule.findAll({
      where: {
        providerId,
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
  } catch (error) {
    throw new AppError('Failed to check availability', 500);
  }
};
