import { Router } from 'express';
import * as userPublicKeyController from '../controllers/userPublicKey.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/:userId', authenticate, asyncHandler(userPublicKeyController.getPublicKey));
router.post('/', authenticate, asyncHandler(userPublicKeyController.updatePublicKey));

export default router;
