import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ServiceProvider, User } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export const getAllSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  const { providerId, dayOfWeek } = req.query;

  const where: any = {
    day_of_week: { [Op.ne]: null }
  };
  
  if (providerId) where.idU_SP = providerId;
  if (dayOfWeek) where.day_of_week = dayOfWeek.toString();

  const providers = await ServiceProvider.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fname', 'lname', 'profile_picture']
      },
    ],
  });

  const availabilities = providers.map(p => ({
    id: p.idU_SP,
    service_provider_id: p.idU_SP,
    day_of_week: p.day_of_week,
    start_time: p.start_time,
    end_time: p.end_time,
    provider: p
  }));

  res.json({ availabilities });
};

export const getScheduleById = async (req: AuthRequest, res: Response): Promise<void> => {
  const provider = await ServiceProvider.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fname', 'lname', 'profile_picture']
      },
    ],
  });

  if (!provider || !provider.day_of_week) {
    throw new AppError('Availability not found', 404);
  }

  const availability = {
    id: provider.idU_SP,
    service_provider_id: provider.idU_SP,
    day_of_week: provider.day_of_week,
    start_time: provider.start_time,
    end_time: provider.end_time,
    provider
  };

  res.json({ availability });
};

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { day_of_week, start_time, end_time } = req.body;
  const providerId = req.user!.id;

  const provider = await ServiceProvider.findByPk(providerId);
  if (!provider) {
    throw new AppError('Service provider not found', 404);
  }

  await provider.update({
    day_of_week: day_of_week?.toString(),
    start_time,
    end_time,
  });

  res.status(201).json({
    message: 'Availability created successfully',
    availability: {
      id: provider.idU_SP,
      service_provider_id: provider.idU_SP,
      day_of_week: provider.day_of_week,
      start_time: provider.start_time,
      end_time: provider.end_time
    },
  });
};

export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { day_of_week, start_time, end_time } = req.body;

  const provider = await ServiceProvider.findByPk(id);
  if (!provider) {
    throw new AppError('Service provider not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (provider.idU_SP !== req.user!.id && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await provider.update({
    day_of_week: day_of_week !== undefined ? day_of_week.toString() : provider.day_of_week,
    start_time: start_time || provider.start_time,
    end_time: end_time || provider.end_time,
  });

  res.json({
    message: 'Availability updated successfully',
    availability: {
      id: provider.idU_SP,
      service_provider_id: provider.idU_SP,
      day_of_week: provider.day_of_week,
      start_time: provider.start_time,
      end_time: provider.end_time
    },
  });
};

export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const provider = await ServiceProvider.findByPk(id);
  if (!provider) {
    throw new AppError('Service provider not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (provider.idU_SP !== req.user!.id && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await provider.update({
    day_of_week: null,
    start_time: null,
    end_time: null,
  });

  res.json({ message: 'Availability deleted successfully' });
};

export const getProviderSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.params.providerId || req.user!.id;

  const provider = await ServiceProvider.findByPk(providerId);
  
  if (!provider || !provider.day_of_week) {
    return res.json({ schedules: { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] } });
  }

  const availability = {
    service_provider_id: provider.idU_SP,
    day_of_week: parseInt(provider.day_of_week, 10),
    start_time: provider.start_time,
    end_time: provider.end_time,
  };

  const weekSchedule: any = { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] };
  if (!isNaN(availability.day_of_week)) {
    weekSchedule[availability.day_of_week] = [availability];
  }

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

  const provider = await ServiceProvider.findOne({
    where: {
      idU_SP: providerId as string,
      day_of_week: dayOfWeek.toString(),
    },
  });

  const isAvailable = provider && timeStr >= provider.start_time! && timeStr <= provider.end_time!;

  res.json({
    available: !!isAvailable,
    dayOfWeek,
    availabilities: provider ? [
      {
        service_provider_id: provider.idU_SP,
        day_of_week: provider.day_of_week,
        start_time: provider.start_time,
        end_time: provider.end_time
      }
    ] : [],
  });
};
