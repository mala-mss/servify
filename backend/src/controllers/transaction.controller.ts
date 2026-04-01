import { Request, Response } from 'express';
import { Transaction, User, Job } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, status, type, jobId } = req.query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (jobId) where.jobId = jobId;

    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: Job, as: 'job', attributes: ['id', 'title', 'date', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ transactions });
  } catch (error) {
    throw new AppError('Failed to fetch transactions', 500);
  }
};

export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: Job, as: 'job', attributes: ['id', 'title', 'date', 'status', 'totalPrice'] },
      ],
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json({ transaction });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch transaction', 500);
  }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, jobId, type, amount, paymentMethod, description } = req.body;

    const transaction = await Transaction.create({
      userId,
      jobId,
      type,
      amount,
      status: 'pending',
      paymentMethod,
      description,
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    throw new AppError('Failed to create transaction', 500);
  }
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentMethod, metadata } = req.body;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    const isAdmin = req.user!.role === 'admin';
    if (transaction.userId !== req.user!.id && !isAdmin) {
      throw new AppError('Unauthorized', 403);
    }

    await transaction.update({
      status: status || transaction.status,
      paymentMethod: paymentMethod || transaction.paymentMethod,
      metadata: metadata || transaction.metadata,
    });

    res.json({
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update transaction', 500);
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin) {
      throw new AppError('Unauthorized', 403);
    }

    await transaction.destroy();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete transaction', 500);
  }
};

export const getUserTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user!.id;

    const transactions = await Transaction.findAll({
      where: { userId },
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title', 'date', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({ transactions });
  } catch (error) {
    throw new AppError('Failed to fetch user transactions', 500);
  }
};

export const getTransactionSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type } = req.params;

    const where: any = { userId };
    if (type) where.type = type;

    const transactions = await Transaction.findAll({ where });

    const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const pending = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const paid = transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    res.json({
      total: total.toFixed(2),
      pending: pending.toFixed(2),
      paid: paid.toFixed(2),
      count: transactions.length,
    });
  } catch (error) {
    throw new AppError('Failed to fetch transaction summary', 500);
  }
};
