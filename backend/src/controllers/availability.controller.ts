import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProviderAvailability, ServiceProvider, User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  const { providerId, dayOfWeek } = req.query;

  const where: any = {};
  if (providerId) where.service_provider_id = providerId;
  if (dayOfWeek) where.day_of_week = parseInt(dayOfWeek as string, 10);

  const availabilities = await ProviderAvailability.findAll({
    where,
    include: [
      {
        model: ServiceProvider,
        as: 'provider',
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }
        ]
      },
    ],
    order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
  });

  res.json({ availabilities });
};

export const getScheduleById = async (req: AuthRequest, res: Response): Promise<void> => {
  const availability = await ProviderAvailability.findByPk(req.params.id, {
    include: [
      {
        model: ServiceProvider,
        as: 'provider',
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }
        ]
      },
    ],
  });

  if (!availability) {
    throw new AppError('Availability not found', 404);
  }

  res.json({ availability });
};

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { day_of_week, start_time, end_time } = req.body;
  const providerId = req.user!.id;

  const availability = await ProviderAvailability.create({
    service_provider_id: providerId,
    day_of_week,
    start_time,
    end_time,
  });

  res.status(201).json({
    message: 'Availability created successfully',
    availability,
  });
};

export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { day_of_week, start_time, end_time } = req.body;

  const availability = await ProviderAvailability.findByPk(id);
  if (!availability) {
    throw new AppError('Availability not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (availability.service_provider_id !== req.user!.id && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await availability.update({
    day_of_week: day_of_week !== undefined ? day_of_week : availability.day_of_week,
    start_time: start_time || availability.start_time,
    end_time: end_time || availability.end_time,
  });

  res.json({
    message: 'Availability updated successfully',
    availability,
  });
};

export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const availability = await ProviderAvailability.findByPk(id);
  if (!availability) {
    throw new AppError('Availability not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (availability.service_provider_id !== req.user!.id && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await availability.destroy();

  res.json({ message: 'Availability deleted successfully' });
};

export const getProviderSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.params.providerId || req.user!.id;

  const availabilities = await ProviderAvailability.findAll({
    where: { service_provider_id: providerId },
    order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
  });

  const weekSchedule = {
    0: availabilities.filter((a: any) => a.day_of_week === 0),
    1: availabilities.filter((a: any) => a.day_of_week === 1),
    2: availabilities.filter((a: any) => a.day_of_week === 2),
    3: availabilities.filter((a: any) => a.day_of_week === 3),
    4: availabilities.filter((a: any) => a.day_of_week === 4),
    5: availabilities.filter((a: any) => a.day_of_week === 5),
    6: availabilities.filter((a: any) => a.day_of_week === 6),
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

  const availabilities = await ProviderAvailability.findAll({
    where: {
      service_provider_id: providerId as string,
      day_of_week: dayOfWeek,
    },
  });

  const isAvailable = availabilities.some((availability: any) => {
    return timeStr >= availability.start_time && timeStr <= availability.end_time;
  });

  res.json({
    available: isAvailable,
    dayOfWeek,
    availabilities,
  });
};
