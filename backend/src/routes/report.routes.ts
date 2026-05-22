import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { getAllReports, createReport, deleteReport } from '../controllers/report.controller';

const router = Router();

router.get('/', authenticate, authorize('admin'), asyncHandler(getAllReports));
router.post('/', authenticate, asyncHandler(createReport));
router.delete('/:id_reporter/:id_reported', authenticate, authorize('admin'), asyncHandler(deleteReport));

export default router;
