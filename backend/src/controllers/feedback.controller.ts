import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Feedback, Booking, User, ServiceProvider } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getAllFeedbacks = async (req: AuthRequest, res: Response): Promise<void> => {
  const feedbacks = await Feedback.findAll({
    include: [
      { model: Booking, as: 'booking' },
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json({ feedbacks });
};

export const getFeedbackById = async (req: AuthRequest, res: Response): Promise<void> => {
  const feedback = await Feedback.findByPk(req.params.id, {
    include: [
      { model: Booking, as: 'booking' },
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
    ],
  });

  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  res.json({ feedback });
};

export const createFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { overall_rating, punctuality, comment, booking_id, client_id } = req.body;

  const feedback = await Feedback.create({
    overall_rating,
    punctuality,
    comment,
    booking_id,
    client_id,
  });

  res.status(201).json({
    message: 'Feedback created successfully',
    feedback,
  });
};

export const updateFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { overall_rating, punctuality, comment } = req.body;

  const feedback = await Feedback.findByPk(id);
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  await feedback.update({
    overall_rating: overall_rating !== undefined ? overall_rating : feedback.overall_rating,
    punctuality: punctuality !== undefined ? punctuality : feedback.punctuality,
    comment: comment !== undefined ? comment : feedback.comment,
  });

  res.json({
    message: 'Feedback updated successfully',
    feedback,
  });
};

export const deleteFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const feedback = await Feedback.findByPk(id);
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  await feedback.destroy();

  res.json({ message: 'Feedback deleted successfully' });
};

export const getProviderFeedbacks = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.params.providerId;

  const feedbacks = await Feedback.findAll({
    include: [
      { 
        model: Booking, 
        as: 'booking',
        where: { service_provider_id: providerId }
      },
      { model: User, as: 'client', attributes: ['id', 'fname', 'lname', 'profile_picture'] },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json({ feedbacks });
};

export const getFeedbackStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const providerId = req.params.providerId;

  const feedbacks = await Feedback.findAll({
    include: [
      { 
        model: Booking, 
        as: 'booking',
        where: { service_provider_id: providerId }
      }
    ]
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
