import { Router } from 'express';
import { body } from 'express-validator';
import * as studentController from '../controllers/student.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { uploadCsv } from '../config/upload.js';

const router = Router();

router.use(authenticate);

router.get(
  '/by-barcode/:code',
  requireRole('super_admin', 'club_admin', 'faculty', 'volunteer'),
  studentController.getByBarcode
);

router.get(
  '/by-roll/:roll',
  requireRole('super_admin', 'club_admin', 'faculty', 'volunteer'),
  studentController.getByRoll
);

router.get('/', requireRole('super_admin'), studentController.list);
router.get('/:id', requireRole('super_admin'), studentController.getById);

router.post(
  '/',
  requireRole('super_admin'),
  [
    body('roll_number').notEmpty().withMessage('Roll number required'),
    body('barcode').notEmpty().withMessage('Barcode required'),
    body('name').notEmpty().withMessage('Name required'),
  ],
  validate,
  studentController.create
);

router.put('/:id', requireRole('super_admin'), studentController.update);
router.delete('/:id', requireRole('super_admin'), studentController.remove);

router.post(
  '/import',
  requireRole('super_admin'),
  uploadCsv.single('file'),
  studentController.importCsv
);

export default router;
