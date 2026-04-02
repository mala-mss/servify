import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Review, User, Job, Service } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { providerId, serviceId, jobId } = req.query;

  const where: any = { isVisible: true };
  if (providerId) where.providerId = providerId;
  if (serviceId) where.serviceId = serviceId;
  if (jobId) where.jobId = jobId;

  const reviews = await Review.findAll({
    where,
    include: [
      { model: User, as: 'client', attributes: ['id', 'name', 'avatar'] },
      { model: User, as: 'provider', attributes: ['id', 'name', 'avatar'] },
      { model: Service, as: 'service', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json({ reviews });
};

export const getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  const review = await Review.findByPk(req.params.id, {
    include: [
      { model: User, as: 'client', attributes: ['id', 'name', 'avatar'] },
      { model: User, as: 'provider', attributes: ['id', 'name', 'avatar'] },
      { model: Service, as: 'service', attributes: ['id', 'name'] },
    ],
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  res.json({ review });
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { jobId, serviceId, rating, comment } = req.body;
  const clientId = req.user!.id;

  if (!jobId && !serviceId) {
    throw new AppError('Either jobId or serviceId is required', 400);
  }

  if (jobId) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    if (job.clientId !== clientId) {
      throw new AppError('Unauthorized to review this job', 403);
    }
  }

  const review = await Review.create({
    clientId,
    providerId: req.body.providerId,
    jobId,
    serviceId,
    rating,
    comment,
    isVisible: true,
  });

  if (review.providerId) {
    const provider = await User.findByPk(review.providerId);
    if (provider) {
      const providerReviews = await Review.findAll({ where: { providerId: provider.id, isVisible: true } });
      const totalRatings = providerReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = providerReviews.length > 0 ? totalRatings / providerReviews.length : 0;

      await provider.update({
        rating: parseFloat(avgRating.toFixed(1)),
        totalJobs: (provider.totalJobs || 0) + 1,
      });
    }
  }

  res.status(201).json({
    message: 'Review created successfully',
    review,
  });
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { rating, comment, isVisible } = req.body;

  const review = await Review.findByPk(id);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (review.clientId !== req.user!.id && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await review.update({
    rating: rating || review.rating,
    comment: comment || review.comment,
    isVisible: isVisible !== undefined ? isVisible : review.isVisible,
  });

  res.json({
    message: 'Review updated successfully',
    review,
  });
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const review = await Review.findByPk(id);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const isAdmin = req.user!.role === 'admin';
  if (review.clientId !== req.user!.id && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  await review.destroy();

  res.json({ message: 'Review deleted successfully' });
};

export const getProviderReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.params.providerId;

  const reviews = await Review.findAll({
    where: { providerId, isVisible: true },
    include: [
      { model: User, as: 'client', attributes: ['id', 'name', 'avatar'] },
      { model: Service, as: 'service', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  const provider = await User.findByPk(providerId);
  const rating = provider?.rating || 0;

  res.json({ reviews, rating });
};

export const getReviewStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const { providerId } = req.params;

  const where: any = { isVisible: true };
  if (providerId) where.providerId = providerId;

  const reviews = await Review.findAll({ where });

  const total = reviews.length;
  const average = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  const distribution = {
    '5': reviews.filter(r => r.rating === 5).length,
    '4': reviews.filter(r => r.rating === 4).length,
    '3': reviews.filter(r => r.rating === 3).length,
    '2': reviews.filter(r => r.rating === 2).length,
    '1': reviews.filter(r => r.rating === 1).length,
  };

  res.json({
    total,
    average: parseFloat(average.toFixed(1)),
    distribution,
  });
};
