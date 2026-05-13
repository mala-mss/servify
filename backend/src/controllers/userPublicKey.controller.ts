import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserPublicKey } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getPublicKey = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  
  const publicKey = await UserPublicKey.findOne({
    where: { user_id: userId }
  });

  if (!publicKey) {
    throw new AppError('Public key not found', 404);
  }

  res.json({ publicKey });
};

export const updatePublicKey = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { public_key } = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Use upsert to handle concurrent requests and avoid unique constraint errors
  const [userPublicKey] = await UserPublicKey.upsert({
    user_id: userId,
    public_key
  });

  res.json({
    message: 'Public key updated successfully',
    publicKey: userPublicKey
  });
};
