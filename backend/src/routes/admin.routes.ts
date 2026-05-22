import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { getInscriptionRequests, handleInscriptionRequest, getRequestDocuments, verifyDocument } from '../controllers/admin.controller';
import { getAnalytics } from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/approvals', asyncHandler(getInscriptionRequests));
router.get('/approvals/:id/documents', asyncHandler(getRequestDocuments));
router.post('/approvals/:id', asyncHandler(handleInscriptionRequest));
router.post('/documents/:docId/verify', asyncHandler(verifyDocument));
router.get('/analytics', asyncHandler(getAnalytics));

export default router;
