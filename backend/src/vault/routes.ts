import { Router } from 'express';
import {
  uploadVideo,
  getVideo,
  downloadVideo,
  getVaultStats,
  getAllVideos,
  getVideoPreview
} from './controllers/vaultController';

const router = Router();

// Get all videos from vault
router.get('/videos', getAllVideos);

// Get video preview
router.get('/preview/:videoId', getVideoPreview);

// Upload video to vault
router.post('/upload', uploadVideo);

// Get video details
router.get('/video/:videoId', getVideo);

// Download video to user library
router.post('/download/:videoId', downloadVideo);

// Get creator vault stats
router.get('/stats/:userId', getVaultStats);

export default router;