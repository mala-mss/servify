import { Request, Response } from 'express';
import { Booking, Service, User, Notification } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (date) where.date = date;

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'avatar', 'phone'] },
        { model: User, as: 'provider', attributes: ['id', 'name', 'avatar', 'phone'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'price', 'category'] },
      ],
      order: [['date', 'DESC'], ['time', 'ASC']],
    });

    res.json({ bookings });
  } catch (error) {
    throw new AppError('Failed to fetch bookings', 500);
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'avatar', 'phone', 'email'] },
        { model: User, as: 'provider', attributes: ['id', 'name', 'avatar', 'phone', 'email'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'description', 'price', 'category'] },
      ],
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    res.json({ booking });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch booking', 500);
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId, date, time, address, notes } = req.body;
    const clientId = req.user!.id;

    const service = await Service.findByPk(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    const booking = await Booking.create({
      clientId,
      providerId: service.providerId,
      serviceId,
      date,
      time,
      address,
      notes,
      totalPrice: service.price,
      status: 'pending',
    });

    await Notification.create({
      userId: service.providerId,
      type: 'booking',
      priority: 'high',
      title: 'New Booking Request',
      message: `You have a new booking request from ${req.user!.name}`,
      data: { bookingId: booking.id },
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    throw new AppError('Failed to create booking', 500);
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, date, time, address, notes } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const isClient = booking.clientId === req.user!.id;
    const isProvider = booking.providerId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isClient && !isProvider && !isAdmin) {
      throw new AppError('Unauthorized', 403);
    }

    if (status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    await booking.update({
      status: status || booking.status,
      date: date || booking.date,
      time: time || booking.time,
      address: address || booking.address,
      notes: notes !== undefined ? notes : booking.notes,
    });

    const notificationUserId = isClient ? booking.providerId : booking.clientId;
    await Notification.create({
      userId: notificationUserId,
      type: 'booking',
      priority: 'medium',
      title: 'Booking Updated',
      message: `Your booking status has been updated to ${booking.status}`,
      data: { bookingId: booking.id },
    });

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update booking', 500);
  }
};

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const isClient = booking.clientId === req.user!.id;
    const isProvider = booking.providerId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isClient && !isProvider && !isAdmin) {
      throw new AppError('Unauthorized', 403);
    }

    await booking.destroy();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to cancel booking', 500);
  }
};

export const getClientBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = req.params.clientId;

    const bookings = await Booking.findAll({
      where: { clientId },
      include: [
        { model: User, as: 'provider', attributes: ['id', 'name', 'avatar', 'rating'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'category'] },
      ],
      order: [['date', 'DESC']],
    });

    res.json({ bookings });
  } catch (error) {
    throw new AppError('Failed to fetch client bookings', 500);
  }
};

export const getProviderBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = req.params.providerId;

    const bookings = await Booking.findAll({
      where: { providerId },
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'avatar'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'category'] },
      ],
      order: [['date', 'DESC']],
    });

    res.json({ bookings });
  } catch (error) {
    throw new AppError('Failed to fetch provider bookings', 500);
  }
};
