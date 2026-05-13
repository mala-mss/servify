import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Feedback, User, ServiceProvider } from '../models';
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
  const { idU_cl, idU_SP } = req.params;
  const feedback = await Feedback.findOne({
    where: { idU_cl, idU_SP },
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
  const { overall_rating, punctuality, title, comment, idU_cl, idU_SP, is_verified_booking } = req.body;

  const feedback = await Feedback.create({
    overall_rating,
    punctuality,
    title,
    comment,
    idU_cl,
    idU_SP,
    is_verified_booking: is_verified_booking || false,
  });

  res.status(201).json({
    message: 'Feedback created successfully',
    feedback,
  });
};

export const updateFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idU_cl, idU_SP } = req.params;
  const { overall_rating, punctuality, title, comment, is_verified_booking } = req.body;

  const feedback = await Feedback.findOne({ where: { idU_cl, idU_SP } });
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

  res.json({
    message: 'Feedback updated successfully',
    feedback,
  });
};

export const deleteFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idU_cl, idU_SP } = req.params;

  const feedback = await Feedback.findOne({ where: { idU_cl, idU_SP } });
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  await feedback.destroy();

  res.json({ message: 'Feedback deleted successfully' });
};

export const getProviderFeedbacks = async (req: AuthRequest, res: Response): Promise<void> => {
  const idU_SP = req.params.providerId;

  const feedbacks = await Feedback.findAll({
    where: { idU_SP },
    include: [
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json({ feedbacks });
};

export const getFeedbackStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const idU_SP = req.params.providerId;

  const feedbacks = await Feedback.findAll({
    where: { idU_SP }
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
