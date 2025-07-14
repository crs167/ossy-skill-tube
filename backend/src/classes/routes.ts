import { Router } from 'express';
import {
  getCreatorDashboard,
  getVideoAnalytics,
  createLiveClass,
  bookLiveClass,
  joinLiveClass
} from './controllers/classController';

const router = Router();

// Creator dashboard
router.get('/dashboard/:userId', getCreatorDashboard);
router.get('/analytics/:videoId', getVideoAnalytics);

// Live classes
router.post('/live/:userId', createLiveClass);
router.post('/book/:classId', bookLiveClass);
router.post('/join/:classId', joinLiveClass);

export default router;