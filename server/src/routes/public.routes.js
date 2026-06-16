import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';

const router = Router();

router.get('/events', publicController.getEvents);
router.get('/events/:id', publicController.getEventById);
router.get('/organizations', publicController.getOrganizations);

export default router;
