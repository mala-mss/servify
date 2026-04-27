import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Payment, Booking, User } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId, status, bookingId } = req.query;

  const where: any = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;
  if (bookingId) where.booking_id = bookingId;

  const payments = await Payment.findAll({
    where,
    include: [
      { model: Booking, as: 'booking', attributes: ['id', 'start_date', 'end_date', 'status', 'total_price'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json({ payments });
};

export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      { model: Booking, as: 'booking', attributes: ['id', 'start_date', 'end_date', 'status', 'total_price'] },
    ],
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  res.json({ payment });
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { booking_id, amount, payment_method, status } = req.body;

  const payment = await Payment.create({
    booking_id,
    amount,
    payment_method,
    status: status || 'pending',
  });

  res.status(201).json({
    message: 'Payment created successfully',
    payment,
  });
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, payment_method } = req.body;

  const payment = await Payment.findByPk(id);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (!isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await payment.update({
    status: status || payment.status,
    payment_method: payment_method || payment.payment_method,
  });

  res.json({
    message: 'Payment updated successfully',
    payment,
  });
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const payment = await Payment.findByPk(id);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (!isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await payment.destroy();

  res.json({ message: 'Payment deleted successfully' });
};

export const getUserTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId || req.user!.id;

  const payments = await Payment.findAll({
    include: [
      {
        model: Booking,
        as: 'booking',
        where: { client_id: userId },
        attributes: ['id', 'start_date', 'end_date', 'status', 'total_price']
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  res.json({ payments });
};

export const getTransactionSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;

  const where: any = {};
  if (userId) {
    // Get payments for user's bookings
    const userBookings = await Booking.findAll({ where: { client_id: userId }, attributes: ['id'] });
    where.booking_id = userBookings.map((b: any) => b.id);
  }

  const payments = await Payment.findAll({ where });

  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  res.json({
    total: total.toFixed(2),
    pending: pending.toFixed(2),
    paid: paid.toFixed(2),
    count: payments.length,
  });
};
