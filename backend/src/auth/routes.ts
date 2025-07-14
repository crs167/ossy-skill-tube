import { Router } from 'express';
import {
  signInWithGoogle,
  sendMagicLink,
  verifyMagicLink,
  upgradeToCreator,
  getUserProfile
} from './controllers/authController';

const router = Router();

// Google OAuth sign-in
router.post('/google', signInWithGoogle);

// Magic link authentication
router.post('/magic-link', sendMagicLink);
router.get('/verify/:token', verifyMagicLink);

// User management
router.put('/upgrade/:userId', upgradeToCreator);
router.get('/profile/:userId', getUserProfile);

export default router;