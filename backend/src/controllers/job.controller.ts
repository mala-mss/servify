import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Job, User, Service, Booking, Notification, Transaction } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, date, providerId, clientId } = req.query;

  const where: any = {};
  if (status) where.status = status;
  if (date) where.date = date;
  if (providerId) where.providerId = providerId;
  if (clientId) where.clientId = clientId;

  const jobs = await Job.findAll({
    where,
    include: [
      { model: User, as: 'client', attributes: ['id', 'name', 'avatar', 'phone'] },
      { model: User, as: 'provider', attributes: ['id', 'name', 'avatar', 'phone', 'rating'] },
      { model: Service, as: 'service', attributes: ['id', 'name', 'category'] },
    ],
    order: [['date', 'DESC'], ['startTime', 'ASC']],
  });

  res.json({ jobs });
};

export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await Job.findByPk(req.params.id, {
    include: [
      { model: User, as: 'client', attributes: ['id', 'name', 'avatar', 'phone', 'email'] },
      { model: User, as: 'provider', attributes: ['id', 'name', 'avatar', 'phone', 'email', 'rating'] },
      { model: Service, as: 'service', attributes: ['id', 'name', 'description', 'price', 'category'] },
      { model: Booking, as: 'booking' },
    ],
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  res.json({ job });
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bookingId, title, date, startTime, endTime, address, notes, totalPrice } = req.body;
  const clientId = req.user!.id;

  let providerId: string;
  let serviceId: string;

  if (bookingId) {
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Service, as: 'service' }],
    });
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    providerId = booking.providerId;
    serviceId = booking.serviceId;
  } else {
    providerId = req.body.providerId;
    serviceId = req.body.serviceId;
  }

  const job = await Job.create({
    bookingId,
    clientId,
    providerId,
    serviceId,
    title: title || 'Service Job',
    date,
    startTime,
    endTime,
    address,
    notes,
    totalPrice: totalPrice || 0,
    status: 'pending',
  });

  await Notification.create({
    userId: providerId,
    type: 'job',
    priority: 'high',
    title: 'New Job Assigned',
    message: `You have a new job from ${req.user!.name}`,
    data: { jobId: job.id },
  });

  res.status(201).json({
    message: 'Job created successfully',
    job,
  });
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, providerNotes, title } = req.body;

  const job = await Job.findByPk(id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const isClient = job.clientId === req.user!.id;
  const isProvider = job.providerId === req.user!.id;
  const isAdmin = req.user!.role === 'admin';

  if (!isClient && !isProvider && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  if (isProvider && providerNotes !== undefined) {
    job.providerNotes = providerNotes;
  }

  if (status) {
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'declined', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    job.status = status;

    if (status === 'completed') {
      await Transaction.create({
        userId: job.providerId,
        jobId: job.id,
        type: 'payment',
        amount: job.totalPrice,
        status: 'pending',
        description: `Payment for job: ${job.title}`,
      });
    }
  }

  if (title) job.title = title;

  await job.save();

  const notificationUserId = isClient ? job.providerId : job.clientId;
  await Notification.create({
    userId: notificationUserId,
    type: 'job',
    priority: 'medium',
    title: 'Job Updated',
    message: `Job status updated to ${job.status}`,
    data: { jobId: job.id },
  });

  res.json({
    message: 'Job updated successfully',
    job,
  });
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const job = await Job.findByPk(id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (!isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await job.destroy();

  res.json({ message: 'Job deleted successfully' });
};

export const getProviderJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.params.providerId || req.user!.id;

  const jobs = await Job.findAll({
    where: { providerId },
    include: [
      { model: User, as: 'client', attributes: ['id', 'name', 'avatar'] },
      { model: Service, as: 'service', attributes: ['id', 'name', 'category'] },
    ],
    order: [['date', 'DESC']],
  });

  res.json({ jobs });
};

export const getClientJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  const clientId = req.params.clientId || req.user!.id;

  const jobs = await Job.findAll({
    where: { clientId },
    include: [
      { model: User, as: 'provider', attributes: ['id', 'name', 'avatar', 'rating'] },
      { model: Service, as: 'service', attributes: ['id', 'name', 'category'] },
    ],
    order: [['date', 'DESC']],
  });

  res.json({ jobs });
};
