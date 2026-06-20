import express from 'express';
import {
  createEvent,
  getSessions,
  getSessionEvents,
  getHeatmap
} from '../controllers/eventController.js';

const router = express.Router();

router.post('/events', createEvent);
router.get('/sessions', getSessions);
router.get('/sessions/:session_id/events', getSessionEvents);
router.get('/heatmap', getHeatmap);

export default router;
