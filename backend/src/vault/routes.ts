import { Router } from 'express';
import {
  uploadVideo,
  getVideo,
  downloadVideo,
  getVaultStats
} from './controllers/vaultController';

const router = Router();

// Upload video to vault
router.post('/upload', uploadVideo);

// Get video details
router.get('/video/:videoId', getVideo);

// Download video to user library
router.post('/download/:videoId', downloadVideo);

// Get creator vault stats
router.get('/stats/:userId', getVaultStats);

export default router;