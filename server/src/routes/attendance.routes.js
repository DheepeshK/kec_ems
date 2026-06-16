import { Router } from 'express';
import { body } from 'express-validator';
import * as attendanceController from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('super_admin', 'club_admin', 'faculty', 'volunteer'));

router.get('/:sessionId/attendance', attendanceController.list);

router.post(
  '/:sessionId/attendance/scan',
  [body('barcode').notEmpty().withMessage('Barcode required')],
  validate,
  attendanceController.scan
);

router.post(
  '/:sessionId/attendance/manual',
  [body('roll_number').notEmpty().withMessage('Roll number required')],
  validate,
  attendanceController.manual
);

router.delete('/:sessionId/attendance/:id', attendanceController.remove);

export default router;
