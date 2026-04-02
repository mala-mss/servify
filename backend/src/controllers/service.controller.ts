import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Service, User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllServices = async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, isActive, providerId } = req.query;

  const where: any = {};
  if (category) where.category = category;
  if (isActive) where.isActive = isActive === 'true';
  if (providerId) where.providerId = providerId;

  const services = await Service.findAll({
    where,
    include: [
      {
        model: User,
        as: 'provider',
        attributes: ['id', 'name', 'avatar', 'rating'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json({ services });
};

export const getServiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  const service = await Service.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'provider',
        attributes: ['id', 'name', 'avatar', 'rating', 'bio'],
      },
    ],
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  res.json({ service });
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, price, unit, category } = req.body;
  const providerId = req.user!.id;

  const service = await Service.create({
    providerId,
    name,
    description,
    price,
    unit,
    category,
    isActive: true,
  });

  res.status(201).json({
    message: 'Service created successfully',
    service,
  });
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, price, unit, category, isActive } = req.body;

  const service = await Service.findByPk(id);
  if (!service) {
    throw new AppError('Service not found', 404);
  }

  if (service.providerId !== req.user!.id && req.user!.role !== 'admin') {
    throw new AppError('Unauthorized', 403);
  }

  await service.update({
    name: name || service.name,
    description: description || service.description,
    price: price || service.price,
    unit: unit || service.unit,
    category: category || service.category,
    isActive: isActive !== undefined ? isActive : service.isActive,
  });

  res.json({
    message: 'Service updated successfully',
    service,
  });
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const service = await Service.findByPk(id);
  if (!service) {
    throw new AppError('Service not found', 404);
  }

  if (service.providerId !== req.user!.id && req.user!.role !== 'admin') {
    throw new AppError('Unauthorized', 403);
  }

  await service.destroy();

  res.json({ message: 'Service deleted successfully' });
};

export const getProviderServices = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.params.providerId;

  const services = await Service.findAll({
    where: { providerId },
    order: [['createdAt', 'DESC']],
  });

  res.json({ services });
};
