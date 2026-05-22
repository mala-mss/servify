import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Feedback, User, ServiceProvider, sequelize } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllFeedbacks = async (_req: AuthRequest, res: Response): Promise<void> => {
  const feedbacks = await Feedback.findAll({
    include: [
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
      { model: ServiceProvider, as: 'provider' }
    ],
    order: [['created_at', 'DESC']],
  });

  res.json({ feedbacks });
};

export const getFeedbackById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idu_cl, idu_sp } = req.params;
  const feedback = await Feedback.findOne({
    where: { idu_cl, idu_sp },
    include: [
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
    ],
  });

  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  res.json({ feedback });
};

export const createFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { overall_rating, punctuality, title, comment, idu_cl, idu_sp, is_verified_booking } = req.body;

  // Use upsert to handle cases where user already left a review for this provider
  const [feedback] = await Feedback.upsert({
    overall_rating,
    punctuality,
    title,
    comment,
    idu_cl,
    idu_sp,
    is_verified_booking: is_verified_booking || false,
  });

  // Update ServiceProvider aggregate rating
  const stats = await Feedback.findAll({
    where: { idu_sp },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('overall_rating')), 'avgRating'],
      [sequelize.fn('COUNT', sequelize.col('idu_cl')), 'count']
    ],
    raw: true
  });

  const avgRating = (stats[0] as any).avgRating || 0;
  const count = (stats[0] as any).count || 0;

  await ServiceProvider.update(
    { rating: avgRating, review_count: count },
    { where: { idu_sp } }
  );

  res.status(201).json({
    message: 'Feedback processed successfully',
    feedback,
  });
};

export const updateFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idu_cl, idu_sp } = req.params;
  const { overall_rating, punctuality, title, comment, is_verified_booking } = req.body;

  const feedback = await Feedback.findOne({ where: { idu_cl, idu_sp } });
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  await feedback.update({
    overall_rating: overall_rating !== undefined ? overall_rating : feedback.overall_rating,
    punctuality: punctuality !== undefined ? punctuality : feedback.punctuality,
    title: title !== undefined ? title : feedback.title,
    comment: comment !== undefined ? comment : feedback.comment,
    is_verified_booking: is_verified_booking !== undefined ? is_verified_booking : feedback.is_verified_booking,
  });

  // Update ServiceProvider aggregate rating
  const stats = await Feedback.findAll({
    where: { idu_sp },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('overall_rating')), 'avgRating'],
      [sequelize.fn('COUNT', sequelize.col('idu_cl')), 'count']
    ],
    raw: true
  });

  const avgRating = (stats[0] as any).avgRating || 0;
  const count = (stats[0] as any).count || 0;

  await ServiceProvider.update(
    { rating: avgRating, review_count: count },
    { where: { idu_sp } }
  );

  res.json({
    message: 'Feedback updated successfully',
    feedback,
  });
};

export const deleteFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idu_cl, idu_sp } = req.params;

  const feedback = await Feedback.findOne({ where: { idu_cl, idu_sp } });
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  await feedback.destroy();

  // Update ServiceProvider aggregate rating after delete
  const stats = await Feedback.findAll({
    where: { idu_sp },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('overall_rating')), 'avgRating'],
      [sequelize.fn('COUNT', sequelize.col('idu_cl')), 'count']
    ],
    raw: true
  });

  const avgRating = (stats[0] as any).avgRating || 0;
  const count = (stats[0] as any).count || 0;

  await ServiceProvider.update(
    { rating: avgRating, review_count: count },
    { where: { idu_sp } }
  );

  res.json({ message: 'Feedback deleted successfully' });
};

export const getProviderFeedbacks = async (req: AuthRequest, res: Response): Promise<void> => {
  const idu_sp = req.params.providerId;

  const feedbacks = await Feedback.findAll({
    where: { idu_sp },
    include: [
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json({ feedbacks });
};

export const getFeedbackStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const idu_sp = req.params.providerId;

  const feedbacks = await Feedback.findAll({
    where: { idu_sp }
  });

  const total = feedbacks.length;
  const avgRating = total > 0 
    ? feedbacks.reduce((sum, f) => sum + Number(f.overall_rating), 0) / total 
    : 0;

  res.json({
    total,
    avgRating,
  });
};
