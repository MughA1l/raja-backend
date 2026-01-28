import express from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Protect all routes
router.use(auth);

// Profile routes
router.get('/profile', settingsController.getProfile);
router.put(
  '/profile',
  upload.single('profileImage'),
  settingsController.updateProfile
);

// Password route
router.patch('/password', settingsController.changePassword);

// Statistics route
router.get('/statistics', settingsController.getStatistics);

// Account management routes
router.post('/logout-all', settingsController.logoutAllSessions);
router.delete('/account', settingsController.deleteAccount);

export default router;
