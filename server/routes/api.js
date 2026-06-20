import express from 'express';
import {
  createEvent,
  getSessions,
  getSessionEvents,
  getHeatmap,
  checkHealth
} from '../controllers/eventController.js';

const router = express.Router();

router.get('/health', checkHealth);
router.post('/events', createEvent);
router.get('/sessions', getSessions);
router.get('/sessions/:session_id/events', getSessionEvents);
router.get('/heatmap', getHeatmap);

export default router;
