import { Router } from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/event.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('super_admin', 'club_admin', 'faculty'), eventController.list);
router.get('/pending', requireRole('super_admin', 'club_admin'), eventController.getPending);
router.get('/:id', requireRole('super_admin', 'club_admin', 'faculty'), eventController.getById);

router.post(
  '/',
  requireRole('super_admin', 'club_admin', 'faculty'),
  [
    body('title').notEmpty().withMessage('Title required'),
    body('start_date').notEmpty().withMessage('Start date required'),
    body('end_date').notEmpty().withMessage('End date required'),
  ],
  validate,
  eventController.create
);

router.put('/:id', requireRole('super_admin', 'club_admin', 'faculty'), eventController.update);
router.delete('/:id', requireRole('super_admin', 'club_admin', 'faculty'), eventController.remove);

router.post('/:id/submit', requireRole('super_admin', 'club_admin', 'faculty'), eventController.submit);
router.post('/:id/approve', requireRole('super_admin', 'club_admin'), eventController.approve);
router.post('/:id/reject', requireRole('super_admin', 'club_admin'), eventController.reject);
router.post('/:id/complete', requireRole('super_admin', 'club_admin', 'faculty'), eventController.complete);

router.post(
  '/:eventId/sessions',
  requireRole('super_admin', 'club_admin', 'faculty'),
  [
    body('name').notEmpty().withMessage('Session name required'),
    body('start_time').notEmpty().withMessage('Start time required'),
    body('end_time').notEmpty().withMessage('End time required'),
  ],
  validate,
  eventController.createSession
);

router.put(
  '/sessions/:sessionId',
  requireRole('super_admin', 'club_admin', 'faculty'),
  eventController.updateSession
);

router.delete(
  '/sessions/:sessionId',
  requireRole('super_admin', 'club_admin', 'faculty'),
  eventController.deleteSession
);

export default router;
