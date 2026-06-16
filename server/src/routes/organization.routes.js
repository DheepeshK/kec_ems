import { Router } from 'express';
import { body } from 'express-validator';
import * as orgController from '../controllers/organization.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { uploadLogo } from '../config/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', orgController.list);
router.get('/:id', orgController.getById);
router.get('/:id/events', orgController.getEvents);

router.post(
  '/',
  requireRole('super_admin', 'club_admin'),
  [
    body('name').notEmpty().withMessage('Name required'),
    body('type').isIn(['club', 'cell', 'forum', 'department']).withMessage('Invalid type'),
  ],
  validate,
  orgController.create
);

router.put(
  '/:id',
  requireRole('super_admin', 'club_admin'),
  orgController.update
);

router.delete(
  '/:id',
  requireRole('super_admin'),
  orgController.remove
);

router.post(
  '/:id/logo',
  requireRole('super_admin', 'club_admin'),
  uploadLogo.single('logo'),
  orgController.uploadLogo
);

export default router;
