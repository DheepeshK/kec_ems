import { Router } from 'express';
import authRoutes from './auth.routes.js';
import organizationRoutes from './organization.routes.js';
import studentRoutes from './student.routes.js';
import eventRoutes from './event.routes.js';
import attendanceRoutes from './attendance.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import publicRoutes from './public.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/students', studentRoutes);
router.use('/events', eventRoutes);
router.use('/sessions', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/public', publicRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'KEC EMS API is running' });
});

export default router;
